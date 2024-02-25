import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const apiEndpoint = 'https://hacker-news.firebaseio.com/v0/topstories.json';
const getStoryUrl = (id) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;

const App = () => {
  const [topStories, setTopStories] = useState([]);

  useEffect(() => {
    const fetchTopStories = async () => {
      const { data: storyIds } = await axios.get(apiEndpoint);
      const topTenStoryIds = storyIds.slice(0, 10);
      
      const storiesPromises = topTenStoryIds.map((id) =>
        axios.get(getStoryUrl(id))
      );

      const storiesResponses = await Promise.all(storiesPromises);
      const stories = storiesResponses.map(response => response.data);
      
      setTopStories(stories);
    };

    fetchTopStories();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hacker News Top Stories</h1>
      </header>
      <main>
        <ul>
          {topStories.map((story, index) => (
            <li key={story.id} className="story">
              <a href={story.url} target="_blank" rel="noopener noreferrer">
                {index + 1}. {story.title}
              </a>
              <div className="story-details">
                <span>{story.score} points</span>
                <span>by {story.by}</span>
                <span>{new Date(story.time * 1000).toLocaleTimeString()}</span>
                <span>{story.descendants} comments</span>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default App;
