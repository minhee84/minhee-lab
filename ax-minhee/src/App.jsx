import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import styled from 'styled-components';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

const topicsAtom = atomWithStorage('topics_data', [
  { id: 1, title: 'html', body: 'html is ...' },
  { id: 2, title: 'css', body: 'css is ...' },
  { id: 3, title: 'javascript', body: 'javascript is ...' },
]);

const Layout = styled.div`
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
`;

const NavList = styled.ol`
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
  li { margin: 12px 0; }
  a { text-decoration: none; color: #007bff; font-weight: bold; }
`;

function Read() {
  const [topics, setTopics] = useAtom(topicsAtom);
  const { id } = useParams();
  const navigate = useNavigate();
  const topic = topics.find(t => t.id === Number(id));

  if (!topic) return <p>글을 찾을 수 없습니다.</p>;

  return (
    <article>
      <h2>{topic.title}</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{topic.body}</p>
      <button onClick={() => {
        if (window.confirm('삭제할까요?')) {
          setTopics(topics.filter(t => t.id !== Number(id)));
          navigate('/');
        }
      }}>삭제</button>
    </article>
  );
}

function Create() {
  const [topics, setTopics] = useAtom(topicsAtom);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const body = e.target.body.value;
    const nextId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 1;
    setTopics([...topics, { id: nextId, title, body }]);
    navigate(`/read/${nextId}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>새 글 쓰기</h2>
      <p><input name="title" placeholder="제목" style={{ width: '100%' }} required /></p>
      <p><textarea name="body" placeholder="내용" style={{ width: '100%', height: '100px' }} required /></p>
      <button type="submit">저장</button>
    </form>
  );
}

function MainContents() {
  const [topics] = useAtom(topicsAtom);
  return (
    <Layout>
      <header>
        <h1><Link to="/" style={{ color: 'black' }}>WEB CRUD</Link></h1>
      </header>
      <NavList>
        {topics.map(t => (
          <li key={t.id}>
            <Link to={`/read/${t.id}`}>{t.title}</Link>
          </li>
        ))}
      </NavList>
      <Routes>
        <Route path="/" element={<p>Welcome - test</p>} />
        <Route path="/read/:id" element={<Read />} />
        <Route path="/create" element={<Create />} />
      </Routes>
      <div style={{ marginTop: '30px' }}>
        <Link to="/create"><button>새 글 만들기</button></Link>
      </div>
    </Layout>
  );
}

// 최종 내보내기
export default function App() {
  return (
    <Router>
      <MainContents />
    </Router>
  );
}