expect = chai.expect

describe 'Multiple Users API tests (the `hidden` tests)', ->
  this.timeout(5000)
  
  it 'reset database (T2)', (done) ->
    $.get '../api/reset.php?secret=15415Reset', (data) ->
      res = JSON.parse(data)
      expect(res).to.have.status
      done()
      
  users = ['jiayu', 'elomar', 'hongbin', 'vinay', 'andy', 'christos']
  posts = (("#{users[i]}_post_#{j}" for j in [0..i]) for i in [0..5])
  likes = [
    {'hongbin': [0..2], 'vinay': [1..3]},
    {'hongbin': [1..2], 'vinay': [2..3]},
    {'jiayu': [0], 'andy': [2..3]},
    {'hongbin': [2]},
    {'hongbin': [1..2], 'vinay': [3]},
    {'hongbin': [2], 'vinay': [2..3]}
  ]
      
  describe 'Part I - Basics', ->
    
    it 'logout prev user', (done) ->
      $.get '../api/logout.php', (data) ->
        res = JSON.parse(data)
        expect(res).to.have.status
        done()
    
    describe 'register users (T1)', ->
      for user in users
        do (user) ->
          it "register with username #{user}", (done) ->
            $.get "../api/register.php?username=#{user}&pw=#{user}", (data) ->
              res = JSON.parse(data)
              expect(res.userID).to.equal user
              done()
      
          afterEach (done) ->
            $.get '../api/logout.php', (data) ->
              res = JSON.parse(data)
              expect(res).to.have.status
              done()
    
    for i in [0..5]
      user = users[i]
      do (i, user) ->
        describe "#{user} do posting (T6)", ->
          beforeEach (done) ->
            $.get "../api/login.php?username=#{user}&pw=#{user}", (data) ->
              res = JSON.parse(data)
              expect(res.userID).to.equal user
              done()
      
          for j in [0..i]
            post = posts[i][j]
            do (j, post) ->
              it "#{user} posts post ##{j}", (done) ->
                $.get "../api/post.php?title=#{post}&flit=#{post}_content", (data) ->
                  res = JSON.parse(data)
                  expect(res).to.have.status
                  done()
          
          it 'show timeline for ' + user + ' (T4)', (done) ->
            $.get '../api/timeline.php', (data) ->
              res = JSON.parse(data)
              expectLength = (i + 1) * (i + 2) / 2
              if expectLength > 10
                  expectLength = 10
              expect(res.posts.length).to.equal(expectLength)
              done()
        
          afterEach (done) ->
            $.get '../api/logout.php', (data) ->
              res = JSON.parse(data)
              expect(res).to.have.status
              done()
    
    for i in [0..5]
      user = users[i]
      like = likes[i]
      do (i, user, like) ->
        describe "#{user} likes posts (T8)", ->
          beforeEach (done) ->
            $.get "../api/login.php?username=#{user}&pw=#{user}", (data) ->
              res = JSON.parse(data)
              expect(res.userID).to.equal user
              done()
          
          for post_owner, posts_to_like of like
            do (post_owner, posts_to_like) ->
              for post_to_like in posts_to_like
                do (post_to_like) ->
                  it "#{user} likes #{post_owner}'s post ##{post_to_like}", (done) ->
                    $.get "../api/search.php?keyword=#{post_owner}_post_#{post_to_like}", (data) ->
                      res = JSON.parse(data)
                      expect(res.posts.length).to.equal(1)
                      expect(res.posts[0].title).to.equal("#{post_owner}_post_#{post_to_like}")
                      expect(res.posts[0].username).to.equal(post_owner)
                      pID = res.posts[0].pID
                      $.get "../api/like.php?pID=#{pID}", (data) ->
                        res = JSON.parse(data)
                        done()
        
          afterEach (done) ->
            $.get '../api/logout.php', (data) ->
              res = JSON.parse(data)
              expect(res).to.have.status
              done()
              

  describe 'Part II - Searching and Listing', ->
    
    it 'logout prev user', (done) ->
      $.get '../api/logout.php', (data) ->
        res = JSON.parse(data)
        expect(res).to.have.status
        done()
        
    it 'login as jiayu (T3)', (done) ->
      $.get '../api/login.php?username=jiayu&pw=jiayu', (data) ->
        res = JSON.parse(data)
        expect(res.userID).to.equal 'jiayu'
        done()

    describe 'search for a user (T7)', ->
      it 'returns result when search for user with key word i', (done) ->
        $.get '../api/user_search.php?username=i', (data) ->
          res = JSON.parse(data)
          expect(res.users.length).to.equal(4)
          expect(res.users).to.contain("christos")
          expect(res.users).to.contain("hongbin")
          expect(res.users).to.contain("jiayu")
          expect(res.users).to.contain("vinay")
          done()
          
    describe 'search for a post (T11)', ->
      it 'returns result when search for key word 3', (done) ->
        $.get '../api/search.php?keyword=3', (data) ->
          res = JSON.parse(data)
          expect(res.posts.length).to.equal 3
          titles = (post.title for post in res.posts)
          expect(titles).to.contain("christos_post_3")
          expect(titles).to.contain("andy_post_3")
          expect(titles).to.contain("vinay_post_3")
          done()
          
    describe 'list hottest posts (T5)', ->
      it 'returns result when list hottest posts based on number of likes, count being 4', (done) ->
        $.get '../api/most_popular_posts.php?count=4', (data) ->
          res = JSON.parse(data)
          expect(res.posts.length).to.equal 4
          titles = (post.title for post in res.posts)
          expect(titles).to.contain 'hongbin_post_2'
          expect(titles).to.contain 'vinay_post_3'
          expect(titles).to.contain 'vinay_post_2'
          expect(titles).to.contain 'hongbin_post_1'
          done()
          
    describe 'recommend posts based on likes (T10)', ->
      it 'returns empty when recommend posts for jiayu based on likes', (done) ->
        $.get '../api/get_recommended_posts.php?count=4', (data) ->
          res = JSON.parse(data)
          expect(res.posts).to.be.empty
          done()
          
      it 'logout jiayu', (done) ->
        $.get '../api/logout.php', (data) ->
          res = JSON.parse(data)
          expect(res).to.have.status
          done()
      
      it 'login as vinay (T3)', (done) ->
        $.get '../api/login.php?username=vinay&pw=vinay', (data) ->
          res = JSON.parse(data)
          expect(res.userID).to.equal 'vinay'
          done()
          
      it 'returns empty when recommend posts for vinay based on likes', (done) ->
        $.get '../api/get_recommended_posts.php?count=4', (data) ->
          res = JSON.parse(data)
          expect(res.posts).to.have.length 4
          titles = (post.title for post in res.posts)
          expect(titles).to.contain 'vinay_post_3'
          expect(titles).to.contain 'hongbin_post_1'
          expect(titles).to.contain 'vinay_post_2'
          expect(titles).to.contain 'hongbin_post_0' 
          done()
          
      it 'logout vinay', (done) ->
        $.get '../api/logout.php', (data) ->
          res = JSON.parse(data)
          expect(res).to.have.status
          done()
      
      it 'login as jiayu again (T3)', (done) ->
        $.get '../api/login.php?username=jiayu&pw=jiayu', (data) ->
          res = JSON.parse(data)
          expect(res.userID).to.equal 'jiayu'
          done()

    describe 'listing posts for a user (T11)', ->
      for i in [0..5]
        user = users[i]
        do (i, user) ->
            it "get all posts for #{user}", (done) ->
              $.get "../api/user_posts.php?user=#{user}", (data) ->
                res = JSON.parse(data)
                expect(res.posts.length).to.equal posts[i].length
                for pi in [0..(posts[i].length-1)]
                  expect(res.posts[pi].username).to.equal user
                  expect(res.posts[pi].title).to.equal "#{user}_post_#{(posts[i].length - 1 - pi)}"
                done()
      

  describe 'Part III - Statistics', ->
    
    describe 'User Statistics (T13)', ->
      for i in [0..5]
        user = users[i]
        do (i, user) ->
            it "get number of posts for #{user}", (done) ->
              $.get "../api/get_num_posts.php?uID=#{user}", (data) ->
                res = JSON.parse(data)
                expect(res.count).to.equal "#{(i+1)}"
                done()
        
      for i in [0..5]
        user = users[i]
        like = likes[i]
        do (i, user, like) ->
            it "get number of likes made by #{user}", (done) ->
              $.get "../api/get_num_likes_of_user.php?uID=#{user}", (data) ->
                res = JSON.parse(data)
                lengths = (l.length for k, l of like)
                expected_sum = lengths.reduce (a, b) -> a + b
                expect(res.count).to.equal "#{expected_sum}"
                done()
    
    describe 'Global Statistics (T14)', ->
      it "get most active users", (done) ->
        $.get "../api/most_active_users.php?count=6", (data) ->
          res = JSON.parse(data)
          expect(res.users).to.deep.equal ['christos', 'andy', 'vinay', 'hongbin', 'elomar', 'jiayu']
          done()


  describe 'Part IV - Error Cases', ->
    
    it 'logout prev user', (done) ->
      $.get '../api/logout.php', (data) ->
        res = JSON.parse(data)
        expect(res).to.have.status
        done()
        
    it 'should fail when login as funnyguy (T3)', (done) ->
      $.get '../api/login.php?username=funnyguy&pw=funnyguy', (data) ->
        res = JSON.parse(data)
        expect(res.status).to.not.be.ok
        done()
        
    it "should fail when register with username z (T1)", (done) ->
      $.get "../api/register.php?username=z&pw=z", (data) ->
        res = JSON.parse(data)
        expect(res.status).to.not.be.ok
        done()
        
    it 'should fail when login as z (T3)', (done) ->
      $.get '../api/login.php?username=z&pw=z', (data) ->
        res = JSON.parse(data)
        expect(res.status).to.not.be.ok
        done()
        
    it "should fail when register with username aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa (T1)", (done) ->
      $.get "../api/register.php?username=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&pw=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", (data) ->
        res = JSON.parse(data)
        expect(res.status).to.not.be.ok
        done()
        
    it 'should fail when login as aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa (T3)', (done) ->
      $.get '../api/login.php?username=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&pw=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', (data) ->
        res = JSON.parse(data)
        expect(res.status).to.not.be.ok
        done()
        
    it "should fail when try to register again with username jiayu and different password (T1)", (done) ->
      $.get "../api/register.php?username=jiayu&pw=fake", (data) ->
        res = JSON.parse(data)
        expect(res.status).to.not.be.ok
        done()
        
    it 'should fail when login as jiayu with that fake password (T3)', (done) ->
      $.get '../api/login.php?username=jiayu&pw=fake', (data) ->
        res = JSON.parse(data)
        expect(res.status).to.not.be.ok
        done()
        
    it 'now normally login as jiayu (T3)', (done) ->
      $.get '../api/login.php?username=jiayu&pw=jiayu', (data) ->
        res = JSON.parse(data)
        expect(res.userID).to.equal 'jiayu'
        done()
    
    it 'returns nothing when search for user with key word x (T7)', (done) ->
      $.get '../api/user_search.php?username=x', (data) ->
        res = JSON.parse(data)
        expect(res.users).to.be.empty
        done()
    
    it 'returns nothing when search for key word 31 (T11)', (done) ->
      $.get '../api/search.php?keyword=31', (data) ->
        res = JSON.parse(data)
        expect(res.posts).to.be.empty
        done()
    
    it 'returns nothing when list hottest posts based on number of likes, count being -100 (T5)', (done) ->
      $.get '../api/most_popular_posts.php?count=-100', (data) ->
        res = JSON.parse(data)
        expect(res.post).to.be.empty
        done()

    it 'returns nothing when recommend posts based on likes, count being -4 (T10)', (done) ->
      $.get '../api/get_recommended_posts.php?count=-4', (data) ->
        res = JSON.parse(data)
        expect(res.post).to.be.empty
        done()
        
    it "returns nothing when get posts for fakeuser", (done) ->
      $.get "../api/user_posts.php?user=fakeuser", (data) ->
        res = JSON.parse(data)
        expect(res.posts).to.be.empty
        done()

  describe 'Part IV - SQL Injection', ->
    
    describe 'Users table related', ->
    
      beforeEach (done) ->
        $.get '../api/logout.php', (data) ->
          res = JSON.parse(data)
          expect(res).to.have.status
          done()
    
      it 'should prevent sql injection in login username', (done) ->
        uname = encodeURI("1'; DROP TABLE USERS CASCADE; --")
        $.get "../api/login.php?username=#{uname}&pw=#{uname}", (data) ->
          res = JSON.parse(data)
          expect(res).to.have.status
          done()

      it 'should prevent sql injection in login password', (done) ->
        pw = encodeURI("' OR '1'='1")
        $.get "../api/login.php?username=jiayu&pw=#{pw}", (data) ->
          res = JSON.parse(data)
          expect(res).to.have.status
          done()
        
      it 'should prevent sql injection in register username', (done) ->
        uname = encodeURI("1'); DROP TABLE USERS CASCADE; --")
        $.get "../api/register.php?username=#{uname}&pw=#{uname}", (data) ->
          res = JSON.parse(data)
          expect(res).to.have.status
          done()
        
      afterEach (done) ->
        $.get '../api/login.php?username=jiayu&pw=jiayu', (data) ->
          res = JSON.parse(data)
          expect(res.userID).to.equal 'jiayu'
          done()
          
    describe 'Posts table related', ->
      
      it "should prevent sql injection in posts table", (done) ->
        post = encodeURI("1','1','1'); DROP TABLE POSTS CASCADE; --")
        $.get "../api/post.php?title=#{post}&flit=#{post}", (data) ->
          res = JSON.parse(data)
          expect(res).to.have.status
          done()
          
      afterEach (done) ->
        $.get '../api/timeline.php', (data) ->
          res = JSON.parse(data)
          expect(res.posts).to.be.ok
          done()

      


