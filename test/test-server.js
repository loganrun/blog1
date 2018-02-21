const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;
chai.use(chaiHttp);

describe('blog-posts', function(){
    
    before(function(){
        return runServer();
    });
    
    after(function(){
        return closeServer();
    });
    
    it('should return blog post on GET', function(){
        return chai.request(app)
        .get('/blog-posts')
        .then(function(res){
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body.length).to.be.at.least(1);
            
            const expextedKeys = ['title', 'content', 'author', 'publishDate'];
            res.body.forEach(function(item){
               expect(item).to.be.a('object') ;
               expect(item).to.include.keys(expextedKeys);
            });
        });
    });
    
    it('should create a new post on POST', function() {
        const newPost = { title: 'the true Black Panther', content: 'jfsdbsfdskdjfjkhdskjfhjsdhfkjhskdjfhkjsdfhkj', 
        author: 'Roberto',publishDate:  "Feb 18, 2018"};
       return chai.request(app)
       .post('/blog-posts')
       .send(newPost)
       .then(function(res){
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be. a('object');
          expect(res.body).to.include.keys('title','content', 'author', 'publishDate');
          expect(res.body.id).to.not.equal(null);
          expect(res.body).to.deep.equal(Object.assign(newPost, {id: res.body.id}));
       });
    });
    
    it('should update blog posts on PUT', function() {
      const updateData = {title: 'Is Killmonger right?', content: 'maybe', author: 'Roboto', publishDate: 'Feb 18, 2018'};
      return chai.request(app)
      .get('/blog-posts')
      .then(function(res){
          updateData.id = res.body[0].id;
          return chai.request(app)
          .put(`/blog-posts/${updateData.id}`)
          .send(updateData);
      })
       
      .then(function(res){
          expect(res).to.have.status(204);
      });
    });
    
    
    it('should delete blog post on DELETE', function(){
       return chai.request(app)
       .get('/blog-posts')
       .then(function(res){
           return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`); 
       })
       
       .then(function(res){
          expect(res).to.have.status(204);
       });
    });
    
    
})