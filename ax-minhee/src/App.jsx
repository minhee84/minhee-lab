import { useState } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import styled from 'styled-components';

// 1. Jotai Store: 브라우저 LocalStorage에 'topics_data'라는 키로 자동 저장
const topicsAtom = atomWithStorage('topics_data', [
  { id: 1, title: 'html', body: 'html is ...' },
  { id: 2, title: 'css', body: 'css is ...' },
  { id: 3, title: 'javascript', body: 'javascript is ...' },
]);
const modeAtom = atom('WELCOME');
const selectedIdAtom = atom(null);

// 2. Styled Components: 전체 레이아웃 스타일
const Container = styled.div`
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  background-color: white;
  min-height: 100vh;
  color: #333;
`;

const NavList = styled.ol`
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  li { margin: 10px 0; }
  a { color: #007bff; text-decoration: none; font-weight: bold; }
`;

const ButtonGroup = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  gap: 10px;
  margin-top: 20px;
  button { padding: 8px 16px; cursor: pointer; }
`;

// 3. Components
function Article({ title, body }) {
  return (
    <article>
      <h2>{title}</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{body}</p>
    </article>
  );
}

export default function App() {
  const [topics, setTopics] = useAtom(topicsAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const [id, setId] = useAtom(selectedIdAtom);

  const selectedTopic = topics.find(t => t.id === id);

  let content = null;
  let contextControl = null;

  if (mode === 'WELCOME') {
    content = <Article title="Welcome" body="Hello, WEB CRUD with Jotai" />;
  } else if (mode === 'READ' && selectedTopic) {
    content = <Article title={selectedTopic.title} body={selectedTopic.body} />;
    contextControl = (
      <>
        <li><button onClick={() => {
          const newTopics = topics.filter(t => t.id !== id);
          setTopics(newTopics);
          setMode('WELCOME');
        }}>Delete</button></li>
      </>
    );
  } else if (mode === 'CREATE') {
    content = (
      <form onSubmit={e => {
        e.preventDefault();
        const title = e.target.title.value;
        const body = e.target.body.value;
        const nextId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 1;
        setTopics([...topics, { id: nextId, title, body }]);
        setId(nextId);
        setMode('READ');
      }}>
        <h2>Create Topic</h2>
        <p><input name="title" placeholder="title" style={{ width: '100%' }} required /></p>
        <p><textarea name="body" placeholder="body" style={{ width: '100%', height: '100px' }} required /></p>
        <p><input type="submit" value="Create" /></p>
      </form>
    );
  }

  return (
    <Container>
      <header>
        <h1><a href="/" onClick={e => { e.preventDefault(); setMode('WELCOME'); }} style={{ color: 'black', textDecoration: 'none' }}>WEB</a></h1>
      </header>
      <NavList>
        {topics.map(t => (
          <li key={t.id}>
            <a href={'/read/' + t.id} onClick={e => { e.preventDefault(); setId(t.id); setMode('READ'); }}>{t.title}</a>
          </li>
        ))}
      </NavList>
      {content}
      <ButtonGroup>
        <li><button onClick={() => setMode('CREATE')}>Create New</button></li>
        {contextControl}
      </ButtonGroup>
    </Container>
  );
}