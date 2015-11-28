(function() {
    var expect;
    expect = chai.expect;
    describe("Single User API tests (included in the handout, should pass without error)", function() {
        this.timeout(5e3);
        it("reset database", function(done) {
            return $.get("../api/reset.php?secret=15415Reset", function(data) {
                var res;
                res = JSON.parse(data);
                expect(res).to.have.status;
                return done();
            });
        });
        describe("user login/logout lifecycle", function() {
            it("register", function(done) {
                return $.get("../api/register.php?username=johndoe&pw=1234567", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.deep.equal({
                        status: 1,
                        userID: "johndoe"
                    });
                    return done();
                });
            });
            it("login", function(done) {
                return $.get("../api/login.php?username=johndoe&pw=1234567", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.deep.equal({
                        status: 1,
                        userID: "johndoe"
                    });
                    return done();
                });
            });
            it("logout", function(done) {
                return $.get("../api/logout.php", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.deep.equal({
                        status: 1
                    });
                    return done();
                });
            });
            return it("login again", function(done) {
                return $.get("../api/login.php?username=johndoe&pw=1234567", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.deep.equal({
                        status: 1,
                        userID: "johndoe"
                    });
                    return done();
                });
            });
        });
        describe("timeline", function() {
            it("is by default empty", function(done) {
                return $.get("../api/timeline.php", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.deep.equal({
                        status: 1,
                        posts: []
                    });
                    return done();
                });
            });
            it("can be posted with articles", function(done) {
                return $.get("../api/post.php?title=hello%20world&flit=my%20life%20is%20cool", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.deep.equal({
                        status: 1
                    });
                    return done();
                });
            });
            it("then show the posted article", function(done) {
                return $.get("../api/timeline.php", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.equal(1);
                    expect(res.posts).to.have.length(1);
                    expect(res.posts[0].title).to.equal("hello world");
                    expect(res.posts[0].username).to.equal("johndoe");
                    expect(res.posts[0].content).to.equal("my life is cool");
                    return done();
                });
            });
            it("should how another article after posted", function(done) {
                return $.get("../api/post.php?title=goodbye%20world&flit=my%20life%20is%20uncool", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.deep.equal({
                        status: 1
                    });
                    return done();
                });
            });
            it("then show both posted articles, sorted by time", function(done) {
                return $.get("../api/timeline.php", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.equal(1);
                    expect(res.posts).to.have.length(2);
                    expect(res.posts[0].title).to.equal("goodbye world");
                    expect(res.posts[0].username).to.equal("johndoe");
                    expect(res.posts[0].content).to.equal("my life is uncool");
                    expect(res.posts[0].pID).to.equal("2");
                    expect(res.posts[1].title).to.equal("hello world");
                    expect(res.posts[1].username).to.equal("johndoe");
                    expect(res.posts[1].content).to.equal("my life is cool");
                    expect(res.posts[1].pID).to.equal("1");
                    return done();
                });
            });
            return it("should also support deletion", function(done) {
                return $.get("../api/delete_post.php?pID=2", function(data) {
                    expect(JSON.parse(data)).to.deep.equal({
                        status: 1
                    });
                    return $.get("../api/timeline.php", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res.status).to.equal(1);
                        expect(res.posts).to.have.length(1);
                        expect(res.posts[0].title).to.equal("hello world");
                        expect(res.posts[0].username).to.equal("johndoe");
                        expect(res.posts[0].content).to.equal("my life is cool");
                        return done();
                    });
                });
            });
        });
        describe("search posts", function() {
            return it("returns article based on content", function(done) {
                return $.get("../api/search.php?keyword=cool", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.equal(1);
                    expect(res.posts).to.have.length(1);
                    expect(res.posts[0].title).to.equal("hello world");
                    expect(res.posts[0].username).to.equal("johndoe");
                    expect(res.posts[0].content).to.equal("my life is cool");
                    return done();
                });
            });
        });
        return describe("search users", function() {
            return it("returns users based on document", function(done) {
                return $.get("../api/user_search.php?username=doe", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.equal(1);
                    expect(res.users).to.have.length(1);
                    expect(res.users[0]).to.equal("johndoe");
                    return done();
                });
            });
        });
    });
}).call(this);

(function() {
    var expect;
    expect = chai.expect;
    describe("Multiple Users API tests (the `hidden` tests)", function() {
        var i, j, likes, posts, users;
        this.timeout(5e3);
        it("reset database (T2)", function(done) {
            return $.get("../api/reset.php?secret=15415Reset", function(data) {
                var res;
                res = JSON.parse(data);
                expect(res).to.have.status;
                return done();
            });
        });
        users = [ "jiayu", "elomar", "hongbin", "vinay", "andy", "christos" ];
        posts = function() {
            var m, results;
            results = [];
            for (i = m = 0; m <= 5; i = ++m) {
                results.push(function() {
                    var n, ref, results1;
                    results1 = [];
                    for (j = n = 0, ref = i; 0 <= ref ? n <= ref : n >= ref; j = 0 <= ref ? ++n : --n) {
                        results1.push(users[i] + "_post_" + j);
                    }
                    return results1;
                }());
            }
            return results;
        }();
        likes = [ {
            hongbin: [ 0, 1, 2 ],
            vinay: [ 1, 2, 3 ]
        }, {
            hongbin: [ 1, 2 ],
            vinay: [ 2, 3 ]
        }, {
            jiayu: [ 0 ],
            andy: [ 2, 3 ]
        }, {
            hongbin: [ 2 ]
        }, {
            hongbin: [ 1, 2 ],
            vinay: [ 3 ]
        }, {
            hongbin: [ 2 ],
            vinay: [ 2, 3 ]
        } ];
        describe("Part I - Basics", function() {
            var fn, like, m, n, results, user;
            it("logout prev user", function(done) {
                return $.get("../api/logout.php", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.have.status;
                    return done();
                });
            });
            describe("register users (T1)", function() {
                var len, m, results, user;
                results = [];
                for (m = 0, len = users.length; m < len; m++) {
                    user = users[m];
                    results.push(function(user) {
                        it("register with username " + user, function(done) {
                            return $.get("../api/register.php?username=" + user + "&pw=" + user, function(data) {
                                var res;
                                res = JSON.parse(data);
                                expect(res.userID).to.equal(user);
                                return done();
                            });
                        });
                        return afterEach(function(done) {
                            return $.get("../api/logout.php", function(data) {
                                var res;
                                res = JSON.parse(data);
                                expect(res).to.have.status;
                                return done();
                            });
                        });
                    }(user));
                }
                return results;
            });
            fn = function(i, user) {
                return describe(user + " do posting (T6)", function() {
                    var fn1, n, post, ref;
                    beforeEach(function(done) {
                        return $.get("../api/login.php?username=" + user + "&pw=" + user, function(data) {
                            var res;
                            res = JSON.parse(data);
                            expect(res.userID).to.equal(user);
                            return done();
                        });
                    });
                    fn1 = function(j, post) {
                        return it(user + " posts post #" + j, function(done) {
                            return $.get("../api/post.php?title=" + post + "&flit=" + post + "_content", function(data) {
                                var res;
                                res = JSON.parse(data);
                                expect(res).to.have.status;
                                return done();
                            });
                        });
                    };
                    for (j = n = 0, ref = i; 0 <= ref ? n <= ref : n >= ref; j = 0 <= ref ? ++n : --n) {
                        post = posts[i][j];
                        fn1(j, post);
                    }
                    it("show timeline for " + user + " (T4)", function(done) {
                        return $.get("../api/timeline.php", function(data) {
                            var expectLength, res;
                            res = JSON.parse(data);
                            expectLength = (i + 1) * (i + 2) / 2;
                            if (expectLength > 10) {
                                expectLength = 10;
                            }
                            expect(res.posts.length).to.equal(expectLength);
                            return done();
                        });
                    });
                    return afterEach(function(done) {
                        return $.get("../api/logout.php", function(data) {
                            var res;
                            res = JSON.parse(data);
                            expect(res).to.have.status;
                            return done();
                        });
                    });
                });
            };
            for (i = m = 0; m <= 5; i = ++m) {
                user = users[i];
                fn(i, user);
            }
            results = [];
            for (i = n = 0; n <= 5; i = ++n) {
                user = users[i];
                like = likes[i];
                results.push(function(i, user, like) {
                    return describe(user + " likes posts (T8)", function() {
                        var fn1, post_owner, posts_to_like;
                        beforeEach(function(done) {
                            return $.get("../api/login.php?username=" + user + "&pw=" + user, function(data) {
                                var res;
                                res = JSON.parse(data);
                                expect(res.userID).to.equal(user);
                                return done();
                            });
                        });
                        fn1 = function(post_owner, posts_to_like) {
                            var len, o, post_to_like, results1;
                            results1 = [];
                            for (o = 0, len = posts_to_like.length; o < len; o++) {
                                post_to_like = posts_to_like[o];
                                results1.push(function(post_to_like) {
                                    return it(user + " likes " + post_owner + "'s post #" + post_to_like, function(done) {
                                        return $.get("../api/search.php?keyword=" + post_owner + "_post_" + post_to_like, function(data) {
                                            var pID, res;
                                            res = JSON.parse(data);
                                            expect(res.posts.length).to.equal(1);
                                            expect(res.posts[0].title).to.equal(post_owner + "_post_" + post_to_like);
                                            expect(res.posts[0].username).to.equal(post_owner);
                                            pID = res.posts[0].pID;
                                            return $.get("../api/like.php?pID=" + pID, function(data) {
                                                res = JSON.parse(data);
                                                return done();
                                            });
                                        });
                                    });
                                }(post_to_like));
                            }
                            return results1;
                        };
                        for (post_owner in like) {
                            posts_to_like = like[post_owner];
                            fn1(post_owner, posts_to_like);
                        }
                        return afterEach(function(done) {
                            return $.get("../api/logout.php", function(data) {
                                var res;
                                res = JSON.parse(data);
                                expect(res).to.have.status;
                                return done();
                            });
                        });
                    });
                }(i, user, like));
            }
            return results;
        });
        describe("Part II - Searching and Listing", function() {
            it("logout prev user", function(done) {
                return $.get("../api/logout.php", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.have.status;
                    return done();
                });
            });
            it("login as jiayu (T3)", function(done) {
                return $.get("../api/login.php?username=jiayu&pw=jiayu", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.userID).to.equal("jiayu");
                    return done();
                });
            });
            describe("search for a user (T7)", function() {
                return it("returns result when search for user with key word i", function(done) {
                    return $.get("../api/user_search.php?username=i", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res.users.length).to.equal(4);
                        expect(res.users).to.contain("christos");
                        expect(res.users).to.contain("hongbin");
                        expect(res.users).to.contain("jiayu");
                        expect(res.users).to.contain("vinay");
                        return done();
                    });
                });
            });
            describe("search for a post (T11)", function() {
                return it("returns result when search for key word 3", function(done) {
                    return $.get("../api/search.php?keyword=3", function(data) {
                        var post, res, titles;
                        res = JSON.parse(data);
                        expect(res.posts.length).to.equal(3);
                        titles = function() {
                            var len, m, ref, results;
                            ref = res.posts;
                            results = [];
                            for (m = 0, len = ref.length; m < len; m++) {
                                post = ref[m];
                                results.push(post.title);
                            }
                            return results;
                        }();
                        expect(titles).to.contain("christos_post_3");
                        expect(titles).to.contain("andy_post_3");
                        expect(titles).to.contain("vinay_post_3");
                        return done();
                    });
                });
            });
            describe("list hottest posts (T5)", function() {
                return it("returns result when list hottest posts based on number of likes, count being 4", function(done) {
                    return $.get("../api/most_popular_posts.php?count=4", function(data) {
                        var post, res, titles;
                        res = JSON.parse(data);
                        expect(res.posts.length).to.equal(4);
                        titles = function() {
                            var len, m, ref, results;
                            ref = res.posts;
                            results = [];
                            for (m = 0, len = ref.length; m < len; m++) {
                                post = ref[m];
                                results.push(post.title);
                            }
                            return results;
                        }();
                        expect(titles).to.contain("hongbin_post_2");
                        expect(titles).to.contain("vinay_post_3");
                        expect(titles).to.contain("vinay_post_2");
                        expect(titles).to.contain("hongbin_post_1");
                        return done();
                    });
                });
            });
            describe("recommend posts based on likes (T10)", function() {
                it("returns empty when recommend posts for jiayu based on likes", function(done) {
                    return $.get("../api/get_recommended_posts.php?count=4", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res.posts).to.be.empty;
                        return done();
                    });
                });
                it("logout jiayu", function(done) {
                    return $.get("../api/logout.php", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res).to.have.status;
                        return done();
                    });
                });
                it("login as vinay (T3)", function(done) {
                    return $.get("../api/login.php?username=vinay&pw=vinay", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res.userID).to.equal("vinay");
                        return done();
                    });
                });
                it("returns empty when recommend posts for vinay based on likes", function(done) {
                    return $.get("../api/get_recommended_posts.php?count=4", function(data) {
                        var post, res, titles;
                        res = JSON.parse(data);
                        expect(res.posts).to.have.length(4);
                        titles = function() {
                            var len, m, ref, results;
                            ref = res.posts;
                            results = [];
                            for (m = 0, len = ref.length; m < len; m++) {
                                post = ref[m];
                                results.push(post.title);
                            }
                            return results;
                        }();
                        expect(titles).to.contain("vinay_post_3");
                        expect(titles).to.contain("hongbin_post_1");
                        expect(titles).to.contain("vinay_post_2");
                        expect(titles).to.contain("hongbin_post_0");
                        return done();
                    });
                });
                it("logout vinay", function(done) {
                    return $.get("../api/logout.php", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res).to.have.status;
                        return done();
                    });
                });
                return it("login as jiayu again (T3)", function(done) {
                    return $.get("../api/login.php?username=jiayu&pw=jiayu", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res.userID).to.equal("jiayu");
                        return done();
                    });
                });
            });
            return describe("listing posts for a user (T11)", function() {
                var m, results, user;
                results = [];
                for (i = m = 0; m <= 5; i = ++m) {
                    user = users[i];
                    results.push(function(i, user) {
                        return it("get all posts for " + user, function(done) {
                            return $.get("../api/user_posts.php?user=" + user, function(data) {
                                var n, pi, ref, res;
                                res = JSON.parse(data);
                                expect(res.posts.length).to.equal(posts[i].length);
                                for (pi = n = 0, ref = posts[i].length - 1; 0 <= ref ? n <= ref : n >= ref; pi = 0 <= ref ? ++n : --n) {
                                    expect(res.posts[pi].username).to.equal(user);
                                    expect(res.posts[pi].title).to.equal(user + "_post_" + (posts[i].length - 1 - pi));
                                }
                                return done();
                            });
                        });
                    }(i, user));
                }
                return results;
            });
        });
        describe("Part III - Statistics", function() {
            describe("User Statistics (T13)", function() {
                var fn, like, m, n, results, user;
                fn = function(i, user) {
                    return it("get number of posts for " + user, function(done) {
                        return $.get("../api/get_num_posts.php?uID=" + user, function(data) {
                            var res;
                            res = JSON.parse(data);
                            expect(res.count).to.equal("" + (i + 1));
                            return done();
                        });
                    });
                };
                for (i = m = 0; m <= 5; i = ++m) {
                    user = users[i];
                    fn(i, user);
                }
                results = [];
                for (i = n = 0; n <= 5; i = ++n) {
                    user = users[i];
                    like = likes[i];
                    results.push(function(i, user, like) {
                        return it("get number of likes made by " + user, function(done) {
                            return $.get("../api/get_num_likes_of_user.php?uID=" + user, function(data) {
                                var expected_sum, k, l, lengths, res;
                                res = JSON.parse(data);
                                lengths = function() {
                                    var results1;
                                    results1 = [];
                                    for (k in like) {
                                        l = like[k];
                                        results1.push(l.length);
                                    }
                                    return results1;
                                }();
                                expected_sum = lengths.reduce(function(a, b) {
                                    return a + b;
                                });
                                expect(res.count).to.equal("" + expected_sum);
                                return done();
                            });
                        });
                    }(i, user, like));
                }
                return results;
            });
            return describe("Global Statistics (T14)", function() {
                return it("get most active users", function(done) {
                    return $.get("../api/most_active_users.php?count=6", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res.users).to.deep.equal([ "christos", "andy", "vinay", "hongbin", "elomar", "jiayu" ]);
                        return done();
                    });
                });
            });
        });
        describe("Part IV - Error Cases", function() {
            it("logout prev user", function(done) {
                return $.get("../api/logout.php", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res).to.have.status;
                    return done();
                });
            });
            it("should fail when login as funnyguy (T3)", function(done) {
                return $.get("../api/login.php?username=funnyguy&pw=funnyguy", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.not.be.ok;
                    return done();
                });
            });
            it("should fail when register with username z (T1)", function(done) {
                return $.get("../api/register.php?username=z&pw=z", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.not.be.ok;
                    return done();
                });
            });
            it("should fail when login as z (T3)", function(done) {
                return $.get("../api/login.php?username=z&pw=z", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.not.be.ok;
                    return done();
                });
            });
            it("should fail when register with username aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa (T1)", function(done) {
                return $.get("../api/register.php?username=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&pw=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.not.be.ok;
                    return done();
                });
            });
            it("should fail when login as aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa (T3)", function(done) {
                return $.get("../api/login.php?username=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&pw=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.not.be.ok;
                    return done();
                });
            });
            it("should fail when try to register again with username jiayu and different password (T1)", function(done) {
                return $.get("../api/register.php?username=jiayu&pw=fake", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.not.be.ok;
                    return done();
                });
            });
            it("should fail when login as jiayu with that fake password (T3)", function(done) {
                return $.get("../api/login.php?username=jiayu&pw=fake", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.status).to.not.be.ok;
                    return done();
                });
            });
            it("now normally login as jiayu (T3)", function(done) {
                return $.get("../api/login.php?username=jiayu&pw=jiayu", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.userID).to.equal("jiayu");
                    return done();
                });
            });
            it("returns nothing when search for user with key word x (T7)", function(done) {
                return $.get("../api/user_search.php?username=x", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.users).to.be.empty;
                    return done();
                });
            });
            it("returns nothing when search for key word 31 (T11)", function(done) {
                return $.get("../api/search.php?keyword=31", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.posts).to.be.empty;
                    return done();
                });
            });
            it("returns nothing when list hottest posts based on number of likes, count being -100 (T5)", function(done) {
                return $.get("../api/most_popular_posts.php?count=-100", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.post).to.be.empty;
                    return done();
                });
            });
            it("returns nothing when recommend posts based on likes, count being -4 (T10)", function(done) {
                return $.get("../api/get_recommended_posts.php?count=-4", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.post).to.be.empty;
                    return done();
                });
            });
            return it("returns nothing when get posts for fakeuser", function(done) {
                return $.get("../api/user_posts.php?user=fakeuser", function(data) {
                    var res;
                    res = JSON.parse(data);
                    expect(res.posts).to.be.empty;
                    return done();
                });
            });
        });
        return describe("Part IV - SQL Injection", function() {
            describe("Users table related", function() {
                beforeEach(function(done) {
                    return $.get("../api/logout.php", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res).to.have.status;
                        return done();
                    });
                });
                it("should prevent sql injection in login username", function(done) {
                    var uname;
                    uname = encodeURI("1'; DROP TABLE USERS CASCADE; --");
                    return $.get("../api/login.php?username=" + uname + "&pw=" + uname, function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res).to.have.status;
                        return done();
                    });
                });
                it("should prevent sql injection in login password", function(done) {
                    var pw;
                    pw = encodeURI("' OR '1'='1");
                    return $.get("../api/login.php?username=jiayu&pw=" + pw, function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res).to.have.status;
                        return done();
                    });
                });
                it("should prevent sql injection in register username", function(done) {
                    var uname;
                    uname = encodeURI("1'); DROP TABLE USERS CASCADE; --");
                    return $.get("../api/register.php?username=" + uname + "&pw=" + uname, function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res).to.have.status;
                        return done();
                    });
                });
                return afterEach(function(done) {
                    return $.get("../api/login.php?username=jiayu&pw=jiayu", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res.userID).to.equal("jiayu");
                        return done();
                    });
                });
            });
            return describe("Posts table related", function() {
                it("should prevent sql injection in posts table", function(done) {
                    var post;
                    post = encodeURI("1','1','1'); DROP TABLE POSTS CASCADE; --");
                    return $.get("../api/post.php?title=" + post + "&flit=" + post, function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res).to.have.status;
                        return done();
                    });
                });
                return afterEach(function(done) {
                    return $.get("../api/timeline.php", function(data) {
                        var res;
                        res = JSON.parse(data);
                        expect(res.posts).to.be.ok;
                        return done();
                    });
                });
            });
        });
    });
}).call(this);