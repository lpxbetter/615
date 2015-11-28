expect = chai.expect

describe 'Single User API tests (included in the handout, should pass without error)', ->
  this.timeout(5000)

  it 'reset database', (done) ->
    $.get '../api/reset.php?secret=15415Reset', (data) ->
      res = JSON.parse(data)
      expect(res).to.have.status
      done()

  describe 'user login/logout lifecycle', ->
    it 'register', (done) ->
      $.get '../api/register.php?username=johndoe&pw=1234567', (data) ->
        res = JSON.parse(data)
        expect(res).to.deep.equal
          'status': 1
          'userID': 'johndoe'
        done()

    it 'login', (done) ->
      $.get '../api/login.php?username=johndoe&pw=1234567', (data) ->
        res = JSON.parse(data)
        expect(res).to.deep.equal
          'status': 1
          'userID': 'johndoe'
        done()

    it 'logout', (done) ->
      $.get '../api/logout.php', (data) ->
        res = JSON.parse(data)
        expect(res).to.deep.equal 'status': 1
        done()

    it 'login again', (done) ->
      $.get '../api/login.php?username=johndoe&pw=1234567', (data) ->
        res = JSON.parse(data)
        expect(res).to.deep.equal
          'status': 1
          'userID': 'johndoe'
        done()

  describe 'timeline', ->

    it 'is by default empty', (done) ->
      $.get '../api/timeline.php', (data) ->
        res = JSON.parse(data)
        expect(res).to.deep.equal
          'status': 1
          'posts': []
        done()

    it 'can be posted with articles', (done) ->
      $.get '../api/post.php?title=hello%20world&flit=my%20life%20is%20cool', (data) ->
        res = JSON.parse(data)
        expect(res).to.deep.equal 'status': 1
        done()

    it 'then show the posted article', (done) ->
      $.get '../api/timeline.php', (data) ->
        res = JSON.parse(data)
        expect(res.status).to.equal 1
        expect(res.posts).to.have.length 1
        expect(res.posts[0].title).to.equal 'hello world'
        expect(res.posts[0].username).to.equal 'johndoe'
        expect(res.posts[0].content).to.equal 'my life is cool'
        done()

    it 'should how another article after posted', (done) ->
      $.get '../api/post.php?title=goodbye%20world&flit=my%20life%20is%20uncool', (data) ->
        res = JSON.parse(data)
        expect(res).to.deep.equal 'status': 1
        done()

    it 'then show both posted articles, sorted by time', (done) ->
      $.get '../api/timeline.php', (data) ->
        res = JSON.parse(data)
        expect(res.status).to.equal 1
        expect(res.posts).to.have.length 2
        expect(res.posts[0].title).to.equal 'goodbye world'
        expect(res.posts[0].username).to.equal 'johndoe'
        expect(res.posts[0].content).to.equal 'my life is uncool'
        expect(res.posts[0].pID).to.equal '2'
        expect(res.posts[1].title).to.equal 'hello world'
        expect(res.posts[1].username).to.equal 'johndoe'
        expect(res.posts[1].content).to.equal 'my life is cool'
        expect(res.posts[1].pID).to.equal '1'
        done()

    it 'should also support deletion', (done) ->
      $.get '../api/delete_post.php?pID=2', (data) ->
        expect(JSON.parse(data)).to.deep.equal 'status': 1
        $.get '../api/timeline.php', (data) ->
          res = JSON.parse(data)
          expect(res.status).to.equal 1
          expect(res.posts).to.have.length 1
          expect(res.posts[0].title).to.equal 'hello world'
          expect(res.posts[0].username).to.equal 'johndoe'
          expect(res.posts[0].content).to.equal 'my life is cool'
          done()

  describe 'search posts', ->
    it 'returns article based on content', (done) ->
      $.get '../api/search.php?keyword=cool', (data) ->
        res = JSON.parse(data)
        expect(res.status).to.equal 1
        expect(res.posts).to.have.length 1
        expect(res.posts[0].title).to.equal 'hello world'
        expect(res.posts[0].username).to.equal 'johndoe'
        expect(res.posts[0].content).to.equal 'my life is cool'
        done()

  describe 'search users', ->
    it 'returns users based on document', (done) ->
      $.get '../api/user_search.php?username=doe', (data) ->
        res = JSON.parse(data)
        expect(res.status).to.equal 1
        expect(res.users).to.have.length 1
        expect(res.users[0]).to.equal 'johndoe'
        done()



