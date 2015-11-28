<?php

include "config.php";

/*
 * For all functions $dbh is a database connection
 */

/*
 * @return handle to database connection
 */
function db_connect($host, $port, $db, $user, $pw) {
	error_reporting(E_ALL);  // Do not display any errors
	return pg_connect("host=$host port=$port dbname=$db user=$user password=$pw");
}

/*
 * Close database connection
 */ 
function close_db_connection($dbh) {
	error_reporting(E_ALL);  // Do not display any errors
	pg_close($dbh);
}

/*
 * Login if user and password match
 * Return associative array of the form:
 * array(
 *		'status' =>  (1 for success and 0 for failure)
 *		'userID' => '[USER ID]'
 * )
 */
function login($dbh, $user, $pw) {
	$user = pg_escape_string($dbh, $user);
	$sql = "SELECT * FROM Users WHERE username = '$user' AND password='$pw';";
	$result = pg_query($dbh, $sql);
	if(!$result || pg_num_rows($result) != 1) {
		return array('status' => 0);
	} 
	return array('status' => 1, 'userID' => $user);
}

/*
 * Register user with given password 
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'userID' => '[USER ID]'
 * )
 */
function register($dbh, $user, $pw) {
  if (strlen($user) <= 2 || strlen($user) > 50) {
    return array('status' => 0);
  }
	$user = pg_escape_string($dbh, $user);
	$sql = "INSERT INTO Users VALUES ('$user', '$pw');";
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	} 
	return array('status' => 1, 'userID' => $user);
}

/*
 * Register user with given password 
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 * )
 */
function post_post($dbh, $title, $msg, $me) {
	$title = pg_escape_string($dbh, $title);
	$msg = pg_escape_string($dbh, $msg);
	$me = pg_escape_string($dbh, $me);
	$sql = "INSERT INTO Posts VALUES (DEFAULT, '$me', '$title', '$msg', cast(extract(epoch from NOW()) as float));";
  error_log($sql);
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	} 
	return array('status' => 1);
}


/*
 * Get timeline of $count most recent posts that were written before timestamp $start
 * For a user $user, the timeline should include all posts.
 * Order by time of the post (going backward in time), and break ties by sorting by the username alphabetically
 * Return associative array of the form:
 * array(
 *		'status' => (1 for success and 0 for failure)
 *		'posts' => [ (Array of post objects) ]
 * )
 * Each post should be of the form:
 * array(
 *		'pID' => (INTEGER)
 *		'username' => (USERNAME)
 *		'title' => (TITLE OF POST)
 *      'content' => (CONTENT OF POST)
 *		'time' => (UNIXTIME INTEGER)
 * )
 */
function get_timeline($dbh, $user, $count = 10, $start = PHP_INT_MAX) {
	$user = pg_escape_string($dbh, $user);
	$start = pg_escape_string($dbh, $start);
	$count = pg_escape_string($dbh, $count);
    $sql = "SELECT * FROM Posts
    WHERE time < $start
    ORDER BY time DESC LIMIT $count;";
    error_log($sql);
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	} 
	$ret = array('status' => 1);
	$ret['posts'] = array();
	while ($row = pg_fetch_row($result)) {
		$post = array(
            "pID" => $row[0],
			"username" => $row[1],
			"title" => $row[2],
			"content" => $row[3],
			"time" => $row[4]
		);
		array_push($ret['posts'], $post);
	} 
	return $ret;
}

/*
 * Get list of $count most recent posts that were written by user $user before timestamp $start
 * Order by time of the post (going backward in time)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'posts' => [ (Array of post objects) ]
 * )
 * Each post should be of the form:
 * array(
 *		'pID' => (INTEGER)
 *		'username' => (USERNAME)
 *		'title' => (TITLE)
 *		'content' => (CONTENT)
 *		'time' => (UNIXTIME INTEGER)
 * )
 */
function get_user_posts($dbh, $user, $count = 10, $start = PHP_INT_MAX) {
	$user = pg_escape_string($dbh, $user);
	$start = pg_escape_string($dbh, $start);
	$count = pg_escape_string($dbh, $count);
	$sql = "SELECT pID, uID, title, content, time
		FROM Posts
		WHERE uID = '$user' AND time < $start 
		ORDER BY time DESC LIMIT $count;";
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	} 
	$ret = array('status' => 1);
	$ret['posts'] = array();
	while ($row = pg_fetch_row($result)) {
		$post = array(
			"pID" => $row[0],
			"username" => $row[1],
			"title" => $row[2],
			"content" => $row[3],
			"time" => $row[4]
		);
		array_push($ret['posts'], $post);
	} 
	return $ret;
}

/*
 * Deletes a post given $user name and $pID.
 * $user must be the one who posted the post $pID.
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success. 0 or 2 for failure)
 * )
 */
function delete_post($dbh, $user, $pID) {
    $user = pg_escape_string($dbh, $user);
    $pID = pg_escape_string($dbh, $pID);
    $sql = "SELECT * FROM Posts WHERE uID='$user' AND pID = '$pID';";
    error_log($sql);
	$result = pg_query($dbh, $sql);
	if(!$result ) {
		return array('status' => 0);
	}  else if ( pg_num_rows($result) == 0 ) {
		return array('status' => 2);
	}
	$sql = "DELETE FROM Posts WHERE pID = '$pID';";
    error_log($sql);
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	}
	return array('status' => 1);
}

function like_post($dbh, $me, $pID) {
	$me = pg_escape_string($dbh, $me);
	$pID = pg_escape_string($dbh, $pID);
	if ($me != $pID) {
		$sql = "INSERT INTO Likes VALUES ('$me', '$pID', cast(extract(epoch from NOW()) as float));";
    error_log($sql);
		$result = pg_query($dbh, $sql);
		if(!$result) {
			return array('status' => 0);
		}
		return array('status' => 1);
	}
	return array('status' => 0);
}

/*
 * Check if $me has already liked post $pID
 * Return true if user $me has liked post $pID or false otherwise
 */
function already_liked($dbh, $me, $pID) {
	$me = pg_escape_string($dbh, $me);
	$pID = pg_escape_string($dbh, $pID);
	$sql = "SELECT * FROM Likes WHERE uID = '$me' AND pID = '$pID';"; 
	$result = pg_query($dbh, $sql);
	if(!$result ) {
		return false;
	}  else if ( pg_num_rows($result) == 0 ) {
		return false;
	}
	return true;
}

/*
 * Find the $count most recent posts that contain the string $key
 * Order by time of the post and break ties by the username (sorted alphabetically A-Z)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'posts' => [ (Array of Post objects) ]
 * )
 */
function search($dbh, $key, $count = 50) {
	$count = pg_escape_string($dbh, $count);
	$key = pg_escape_string($dbh, $key);
	$sql = "SELECT * FROM Posts WHERE content LIKE '%$key%' ORDER BY time DESC, uID ASC LIMIT $count;";
  error_log($sql);
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	} 
	$ret = array('status' => 1);
	$ret['posts'] = array();
	while ($row = pg_fetch_row($result)) {
		$post = array(
			"pID" => $row[0],
			"username" => $row[1],
			"title" => $row[2],
			"content" => $row[3],
			"time" => $row[4]
		);
		array_push($ret['posts'], $post);
	} 
	return $ret;
}

/*
 * Find all users whose username includes the string $name
 * Sort the users alphabetically (A-Z)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'users' => [ (Array of user IDs) ]
 * )
 */
function user_search($dbh, $name) {
	$name = pg_escape_string($dbh, $name);
	$sql = "SELECT username FROM Users WHERE username LIKE '%$name%' ORDER BY username ASC;";
  error_log($sql);
	$result = pg_query($dbh, $sql);
	if(!$result) {
    error_log("no results");
		return array('status' => 0);
	} 
	$ret = array('status' => 1);
	$ret['users'] = array();
	while ($row = pg_fetch_row($result)) {
		array_push($ret['users'], $row[0]);
	} 
	return $ret;
}


/*
 * Get the number of likes of post $pID
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'count' => (The number of likes)
 * )
 */
function get_num_likes($dbh, $pID) {
	$pID = pg_escape_string($dbh, $pID);
	$sql = "SELECT COUNT(*) FROM Likes WHERE pID = $pID;";
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	}
	$ret = array('status' => 1);
	$row = pg_fetch_row($result);
	$ret['count'] = $row[0];
	return $ret;
}

/*
 * Get the number of posts of user $uID
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'count' => (The number of posts)
 * )
 */
function get_num_posts($dbh, $uID) {
	$uID = pg_escape_string($dbh, $uID);
	$sql = "SELECT COUNT(*) FROM Posts WHERE uID = '$uID';";
    error_log($sql);
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	}
	$ret = array('status' => 1);
	$row = pg_fetch_row($result);
	$ret['count'] = $row[0];
	return $ret;
}

/*
 * Get the number of likes user $uID made
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'count' => (The number of likes)
 * )
 */
function get_num_likes_of_user($dbh, $uID) {
	$uID = pg_escape_string($dbh, $uID);
	$sql = "SELECT COUNT(*) FROM Likes WHERE uID = '$uID';";
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	}
	$ret = array('status' => 1);
	$row = pg_fetch_row($result);
	$ret['count'] = $row[0];
	return $ret;
}

/*
 * Get the list of $count users that have posted the most
 * Order by the number of posts (descending), and then by username (A-Z)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'users' => [ (Array of user IDs) ]
 * )
 */
function get_most_active_users($dbh, $count = 10) {
	$count = pg_escape_string($dbh, $count);
	$sql = "SELECT username, COUNT(*) as cnt
      FROM Users INNER JOIN Posts ON Users.username = Posts.uID
      GROUP BY username
      ORDER BY cnt DESC, username ASC LIMIT $count;";
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	} 
	$ret = array('status' => 1);
	$ret['users'] = array();
	while ($row = pg_fetch_row($result)) {
		array_push($ret['users'], $row[0]);
	} 
	return $ret;
}

/*
 * Get the list of $count posts posted after $from that have the most likes.
 * Order by the number of likes (descending)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'posts' => [ (Array of post objects) ]
 * )
 * Each post should be of the form:
 * array(
 *		'pID' => (INTEGER)
 *		'username' => (USERNAME)
 *		'title' => (TITLE OF POST)
 *      'content' => (CONTENT OF POST)
 *		'time' => (UNIXTIME INTEGER)
 * )
 */
function get_most_popular_posts($dbh, $count = 10, $from = 0) {
	$count = pg_escape_string($dbh, $count);
    $from = pg_escape_string($dbh, $from);
  $sql = "SELECT P2.pid, P2.uid, P2.title, P2.content, P2.time FROM 
    (SELECT L.pID, COUNT(*) as cnt FROM 
     (Likes as L JOIN (SELECT pID FROM Posts WHERE time > $from) as P1 on L.pid=P1.pid)
      GROUP BY L.pID) as C 
     JOIN (SELECT * FROM Posts) as P2 on C.pID=P2.pID 
     ORDER BY cnt DESC LIMIT $count;";
    error_log($sql);
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	} 
	$ret = array('status' => 1);
	$ret['posts'] = array();
	while ($row = pg_fetch_row($result)) {
    $post = array(
        "pID" => $row[0],
        "username" => $row[1],
        "title" => $row[2],
        "content" => $row[3],
        "time" => $row[4]
    );
		array_push($ret['posts'], $post);
	}
	return $ret;
}

/*
 * Recommend posts for user $user.
 * A post $p is a recommended post for $user if like minded users of $user also like the post,
 * where like minded users are users who like the posts $user likes.
 * Result should not include posts $user liked.
 * Rank the recommended posts by how many like minded users like the posts.
 * The set of like minded users should not include $user self.
 *
 * Return associative array of the form:
 * array(
 *    'status' =>   (1 for success and 0 for failure)
 *    'posts' => [ (Array of post objects) ]
 * )
 * Each post should be of the form:
 * array(
 *		'pID' => (INTEGER)
 *		'username' => (USERNAME)
 *		'title' => (TITLE OF POST)
 *    'content' => (CONTENT OF POST)
 *		'time' => (UNIXTIME INTEGER)
 * )
 */
function get_recommended_posts($dbh, $count = 10, $user) {
	$count = pg_escape_string($dbh, $count);
    $user = pg_escape_string($dbh, $user);

  $sql = "SELECT P.pID, P.uID, P.title, P.content, P.time FROM
    (SELECT L2.pID, COUNT(*) as cnt FROM 
    (SELECT L2.uID, L2.pID FROM 
     (SELECT * FROM Likes WHERE uID='$user') as L1 
     JOIN (SELECT * FROM Likes) as L2 
     on L1.pID=L2.pID AND L1.uID!=L2.uID) as LMU 
    JOIN (SELECT * FROM Likes) as L2 
    on LMU.uID=L2.uID 
    WHERE L2.pID NOT IN (SELECT pID FROM Likes WHERE uID='$user')
    GROUP BY L2.pID) as R
    JOIN (SELECT * FROM Posts) as P
    on R.pid=P.pid ORDER BY cnt DESC LIMIT $count;";
  error_log($sql);
	$result = pg_query($dbh, $sql);
	if(!$result) {
		return array('status' => 0);
	} 
	$ret = array('status' => 1);
	$ret['posts'] = array();
	while ($row = pg_fetch_row($result)) {
        $post = array(
            "pID" => $row[0],
            "username" => $row[1],
            "title" => $row[2],
            "content" => $row[3],
            "time" => $row[4]
        );
    	array_push($ret['posts'], $post);
	}
	return $ret;

}

/*
 * Delete all tables in the database and then recreate them (without any data)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 * )
 */
function reset_database($dbh) {
	$res1 = pg_query($dbh, "DROP TABLE Users;");
	$res2 = pg_query($dbh, "DROP TABLE Posts;");
	$res3 = pg_query($dbh, "DROP TABLE Votes;");
	$res4 = pg_query($dbh, "DROP TABLE HashTag;");
	$res5 = pg_query($dbh, "DROP TABLE Contains;");
	
	$query = "CREATE TABLE Users (
		userName VARCHAR(50) UNIQUE, 
		password VARCHAR(32) NOT NULL, 
		PRIMARY KEY(userName),
		CHECK (char_length(trim(userName)) > 2) 
	)";
	$res6 = pg_query($dbh,$query);
	
	$query = "CREATE TABLE Posts ( 
	        postID SERIAL,
			title VARCHAR(20) NOT NULL, 
			content VARCHAR(42) NOT NULL, 
		        loc_x INTEGER,
			        loc_y INTEGER,
					userName VARCHAR(50) NOT NULL, 
				        time bigint, 
						PRIMARY KEY (postID), 
		FOREIGN KEY (userName) REFERENCES Users (userName)
	)";
	$res7 = pg_query($dbh,$query);
	
	/* which user votes for which post at which time */
	$query = "CREATE TABLE Votes(
		userName VARCHAR(50) NOT NULL,
	    postID INTEGER NOT NULL,
	    time bigint,
		PRIMARY KEY(postID,userName),
	FOREIGN KEY(postID) REFERENCES Posts (postID),
	FOREIGN KEY(userName) REFERENCES Users (userName)
)";
	$res8 = pg_query($dbh,$query);
	
	/* which post contain what kind of hashTags */
	$query = "CREATE TABLE HashTag (
	    tagID SERIAL,
		tagName VARCHAR(20) NOT NULL,
		PRIMARY KEY(tagID)
	)";
	$res9 = pg_query($dbh,$query);
	
	$query = "CREATE TABLE Contains (
	    postID INTEGER,
	    tagID INTEGER,
		PRIMARY KEY (postID, tagID),
	FOREIGN KEY (postID) REFERENCES Posts (postID),
		FOREIGN KEY (tagID) REFERENCES HashTag (tagID)
	)";
	$res10 = pg_query($dbh,$query);
	
	
	if ($res1 != false && $res2 != false && $res3 != false && $res4 != false && $res5 != false && 
	        $res6 != false && $res7 !=false && $res8 !=false && $res9 != false && $res10 != false) {
				return array("status" => 1);
				    } else {
						return array("status" => 0);
						    }
}

?>
