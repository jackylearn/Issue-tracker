'use strict';
  const mongoose = require('mongoose')
  mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
  mongoose.set('useFindAndModify', false);

  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {console.log("db is connected.")})

  const Issues = require('../models/issues.js')

module.exports = function (app) {
  // list all issues
  app.route('/api/issues/apitest')
    .get((req, res) => {
      Issues.find({})
            .select(['_id', 'issue_title', 'issue_text', 'created_on', 'updated_on', 'created_by', 'assigned_to', 'open', 'status_text'])
            .exec((err, doc) => {
              // if (err) return console.log(err)
              res.send(doc)
            })
    })
    
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filter = req.query
      filter.project = project
      Issues.find(filter)
            .exec((err, doc) => {
              // if (err) return console.log(err)
              res.send(doc)
            })
    })
    
    .post(function (req, res){
      let project = req.params.project;

      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by)
        return res.send({ error: 'required field(s) missing' })
        
      console.log(req.body)
      let issue = new Issues({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || ""
      })
      
      issue.save((err, doc) => {
        // if (err) return console.log(err)
        console.log(`New issue "${doc.issue_title}" is added.`)
        res.send(doc)
      })
    })
    
    .put(function (req, res){
      let project = req.params.project;
      if (!req.body._id) return res.send({ error: 'missing _id' })
      if (Object.keys(req.body).length <= 1) 
        return res.send({ error: 'no update field(s) sent', _id: req.body._id })

      Issues.findById(req.body._id)
            .exec((err, doc) => {
              if (err || !doc) return res.send({ error: 'could not update', _id: req.body._id })
              let keys = Object.keys(req.body)
              keys.forEach(key => {
                doc[key] = req.body[key]
              })
              doc.updated_on = new Date()
              
              let title = doc.issue_title
              // save function will return a promise with undefined
              doc.save((err, _) => {
                // if (err) return console.log(err)
                console.log(`Issue "${title}" has been modified.`)   
                res.send({ result: 'successfully updated', _id: req.body._id })
              })
            })
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      if (!req.body._id) return res.send({ error: 'missing _id' })
      Issues.findByIdAndRemove(req.body._id, (err, doc) => {
        if (err || !doc) 
          return res.send({ error: 'could not delete', _id: req.body._id })
        
        console.log(`Issue "${doc.issue_title}" has been deleted.`)
        res.send({ result: 'successfully deleted', _id: doc._id})
      })

    });


};
