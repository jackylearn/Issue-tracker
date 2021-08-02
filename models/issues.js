const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema({
  project: {
    type: String
  },
  issue_title: {
    type: String, 
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  updated_on: {
    type: Date,
    default: Date.now
  },
  created_by: String,
  assigned_to: String,
  open: {
    type: Boolean,
    default: true
  },
  status_text: String
})


module.exports = mongoose.model('Issue', issueSchema)