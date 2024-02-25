import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const apiEndpoint = 'https://hacker-news.firebaseio.com/v0/topstories.json';
const getStoryUrl = id => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;

const App = () => {
  const [topStories, setTopStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchTopStories = async () => {
      const { data: storyIds } = await axios.get(apiEndpoint);
      const topTenStoryIds = storyIds.slice(0, 10);

      const storiesPromises = topTenStoryIds.map(id => axios.get(getStoryUrl(id)));

      const storiesResponses = await Promise.all(storiesPromises);
      const stories = storiesResponses.map(response => response.data);

      setTopStories(stories);
    };

    fetchTopStories();
  }, []);

  const fetchComments = async (kids) => {
    const commentsPromises = kids.slice(0, 10).map(id => axios.get(getStoryUrl(id)));
    const commentsResponses = await Promise.all(commentsPromises);
    const comments = commentsResponses.map(response => response.data);

    // Fetch children of the comments
    for (const comment of comments) {
      if (comment.kids) {
        comment.children = await fetchComments(comment.kids);
      }
    }

    return comments;
  };

  const handleStoryClick = async (story) => {
    setSelectedStory(story);
    const storyComments = story.kids ? await fetchComments(story.kids) : [];
    setComments(storyComments);
  };

  const renderComments = (comments) => {
    return comments.map(comment => (
      <div key={comment.id} className="comment">
        <div className="comment-text">{comment.text}</div>
        {comment.children && <div className="children">{renderComments(comment.children)}</div>}
      </div>
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hacker News Top Stories</h1>
      </header>
      <main>
        <ul>
          {topStories.map(story => (
            <li key={story.id} className="story">
              <a href={story.url} target="_blank" rel="noopener noreferrer">
                {story.title}
              </a>
              <div className="story-details">
                <span>{story.score} points</span>
                <span>by {story.by}</span>
                <span>{new Date(story.time * 1000).toLocaleTimeString()}</span>
                <span>{story.descendants} comments</span>
                <button onClick={() => handleStoryClick(story)}>Show Comments</button>
              </div>
            </li>
          ))}
        </ul>
        {selectedStory && (
          <div className="comments-section">
            <h2>Comments for {selectedStory.title}</h2>
            {renderComments(comments)}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
