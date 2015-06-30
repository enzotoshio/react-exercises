var CommentBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadComments: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'jsonp',
      cache: false,
      success: function(data) {
        this.setState({data: data.comments});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  loadLocal: function() {
    this.setState({ data: JSON.parse(localStorage.getItem('comments')) });
  },
  handleSubmit: function(comment) {
    var comments = JSON.parse(localStorage.getItem('comments')) || [];

    comments.push(comment);

    localStorage.setItem('comments', JSON.stringify(comments));
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

React.render(
  <CommentBox url="http://www.mocky.io/v2/5592fed03c82b22510eea69c" pollInterval={2000} />,
  document.getElementById('content')
);
