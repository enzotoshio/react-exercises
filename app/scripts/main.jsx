var $ = require('jquery')(window);
var React = require('react');
var marked = require('marked');
var underscore = require('underscore');
var Backbone = require('backbone');
Backbone.LocalStorage = require('backbone.localstorage');
window.App = {
  Models: {},
  Collections: {},
  Router: {}
};

window.App.Models.Comment = Backbone.Model.extend({
  defaults: {
    author: 'John Doe',
    text: '...'
  }
});

window.App.Collections.Comments = Backbone.Collection.extend({
  localStorage: new Backbone.LocalStorage('comments'),
  model: window.App.Models.Comment
});

window.App.Router = Backbone.Router.extend({
  routes: {
    '': 'init'
  },
  init: function() {
    var teste = new window.App.Collections.Comments();
    teste.fetch().done(function(data) {
      React.render(
        <CommentBox data={data} collection={teste} pollInterval={2000} />,
        document.getElementById('content')
      );
    });
  }
});

function init() {
  this.router = new window.App.Router();

  Backbone.history.start({ pushstate: true, trigger: true, root: '/'});
}


var CommentBox = React.createClass({
  getInitialState: function() {
    return {data: this.props.data || []};
  },
  loadLocal: function() {
    var that = this;
    this.props.collection.fetch().done(function(data) {
      that.setState({ data: data });
    });
  },
  handleSubmit: function(comment) {
    this.props.collection.create(comment);
    this.loadLocal();
  },
  componentDidMount: function() {
    this.loadLocal();
    setInterval(this.loadLocal, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments:</h1>
        <CommentList data={this.state.data} />
        <CommentForm onSubmit={this.handleSubmit} />
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();

    var author = React.findDOMNode(this.refs.author).value.trim();
    var comment = React.findDOMNode(this.refs.text).value.trim();

    if(!comment || !author) {
      return;
    }

    this.props.onSubmit({author: author, text: comment});

    React.findDOMNode(this.refs.author).value = "";
    React.findDOMNode(this.refs.text).value = "";

    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your Name" ref="author" />
        <input type="text" placeholder="Your comment" ref="text" />
        <input type="submit" value="POST" />
      </form>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    if(this.props.data) {
      var commentNodes = this.props.data.map(function(comment) {
        return (
          <Comment author={comment.author}>
            {comment.text}
          </Comment>
        );
      });
    }

    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var Comment = React.createClass({
  render: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});

    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

init();
