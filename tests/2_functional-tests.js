const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

let testId;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Create', () => {
    test('input with every field', (done) => {
      chai
        .request(server)
        .post('/api/issues/pj1')
        .send({
          issue_title: 'issue1',
          issue_text: 333,
          created_by: 'me',
          assigned_to: 'him',
          status_text: 'dev'
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          // input by user
          assert.equal(response.issue_title, 'issue1')
          assert.equal(response.issue_text, '333')
          assert.equal(response.created_by, 'me')
          assert.equal(response.assigned_to, 'him')
          assert.equal(response.status_text, 'dev')
          // provided by server or db
          assert.equal(response.open, true)
          assert.isNotNull(response.created_on)
          assert.isNotNull(response.updated_on)
          testId = response._id
          done();
        })
    })

    test('input with only required field', (done) => {
      chai
        .request(server)
        .post('/api/issues/pj1')
        .send({
          issue_title: 'issue2',
          issue_text: 'dsaf',
          created_by: 'me'
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          // input by user
          assert.equal(response.issue_title, 'issue2')
          assert.equal(response.issue_text, 'dsaf')
          assert.equal(response.created_by, 'me')
          // blank field
          assert.equal(response.assigned_to, "")
          assert.equal(response.status_text, "")
          // provided by server or db
          assert.equal(response.open, true)
          assert.isNotNull(response.created_on)
          assert.isNotNull(response.updated_on)
          done()
        })
    
    })

    test('missing required field', (done) => {
      chai
        .request(server)
        .post('/api/issues/pj1')
        .send({
          issue_title: 'issue3',
          issue_text: 'dsaf'
        })
        .end((err, res) => {
          // if (err) return console.log(err)
          let response = JSON.parse(res.text)
          assert.equal(response.error, 'required field(s) missing')
          done()
        })
    })
  })

  suite('Read', () => {
    test('get without filter', (done) => {
      chai
        .request(server)
        .get('/api/issues/pj1')
        .end((err, res) => {
          // if (err) return console.log(err)
          assert.equal(res.status, 200)
          done()
        })
    })

    test('get with one filter', (done) => {
      chai
        .request(server)
        .get('/api/issues/pj1?open=true')
        .end((err, res) => {
          // if (err) return console.log(err)
          assert.equal(res.status, 200)
          done()
        })
    })

    test('get with multiple filters', (done) => {
      chai
        .request(server)
        .get('/api/issues/pj1?open=true&created_by=me')
        .end((err, res) => {
          // if (err) return console.log(err)
          assert.equal(res.status, 200)
          done()
        })
    })
  })

  suite('Update', () => {
    test('update one field', (done) => {
      chai
        .request(server)
        .put('/api/issues/pj1')
        .send({ _id: testId, open: false  })
        .end((err, res) => {
          // if (err) return console.log(err)

          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          assert.equal(response.result, 'successfully updated')
          done()
        })
    })

    test('update multiple fields', (done) => {
      chai
        .request(server)
        .put('/api/issues/pj1')
        .send({ _id: testId, open: false, assigned_to: 'k' })
        .end((err, res) => {
          // if (err) return console.log(err)

          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          assert.equal(response.result, 'successfully updated')
          done()
        })
    })

    test('missing _id', (done) => {
      chai
        .request(server)
        .put('/api/issues/pj1')
        .send({ issue_text: 'a' })
        .end((err, res) => {
          // if (err) return console.log(err)
          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          assert.equal(response.error, 'missing _id')
          done()
        })
    })

    test('no field to update', (done) => {
      chai
        .request(server)
        .put('/api/issues/pj1')
        .send({ _id: testId })
        .end((err, res) => {
          // if (err) return console.log(err)
          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          assert.equal(response.error, 'no update field(s) sent')
          done()
        })
    })

    test('invalid id', (done) => {
      chai
        .request(server)
        .put('/api/issues/pj1')
        .send({ _id: ';' , open: false })
        .end((err, res) => {
          // if (err) return console.log(err)
          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          assert.equal(response.error, 'could not update')
          done()
        })
    })
  })

  suite('Delete', () => {
    test('normal delete', (done) => {
      chai
        .request(server)
        .delete('/api/issues/pj1')
        .send({ _id: testId})
        .end((err, res) => {
          // if (err) return console.log(err)
          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          assert.equal(response.result, 'successfully deleted')
          done()
        })
    })

    test('invalid id', (done) => {
      chai
        .request(server)
        .delete('/api/issues/pj1')
        .send({ _id: "a"})
        .end((err, res) => {
          // if (err) return console.log(err)
          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          assert.equal(response.error, 'could not delete')
          done()
        })
    })

    test('missing id', (done) => {
      chai
        .request(server)
        .delete('/api/issues/pj1')
        .end((err, res) => {
          // if (err) return console.log(err)
          assert.equal(res.status, 200)
          let response = JSON.parse(res.text)
          assert.equal(response.error, 'missing _id')
          done()
        })
    })
  })
});
