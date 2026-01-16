/* 필요한 라이브러리 및 도구 임포트 */
import { atom, useAtom } from 'jotai'; // 전역 상태 관리를 위한 Jotai 기본 훅
import { atomWithStorage } from 'jotai/utils'; // 데이터를 로컬 스토리지에 자동 저장하는 유틸리티
import styled from 'styled-components'; // CSS-in-JS 스타일링 도구
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
// HashRouter: 배포 시 404 에러 방지를 위한 라우터
// useParams: URL의 변수(:id)를 추출, useNavigate: 페이지 강제 이동

/* 전역 상태(Store) 설정 및 로컬 스토리지 연동 */
// 'topics_data'라는 키로 브라우저에 저장되며, 초기값이 없을 때 아래 배열을 사용함
const topicsAtom = atomWithStorage('topics_data', [
  { id: 1, title: 'html', body: 'html is ...' },
  { id: 2, title: 'css', body: 'css is ...' },
  { id: 3, title: 'javascript', body: 'javascript is ...' },
]);

/* Styled-components를 이용한 레이아웃 디자인 */
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

/* [Read & Delete] 상세 보기 및 삭제 컴포넌트 */
function Read() {
  const [topics, setTopics] = useAtom(topicsAtom); // 전역 스토어에서 데이터 가져오기
  const { id } = useParams(); // URL 주소에서 id 값 추출 (예: /read/1 -> 1)
  const navigate = useNavigate(); // 삭제 후 이동을 위한 내비게이터
 
  // 전체 데이터 중 URL의 id와 일치하는 데이터 찾기
  const topic = topics.find(t => t.id === Number(id));

  if (!topic) return <p>글을 찾을 수 없습니다.</p>;

  return (
    <article>
      <h2>{topic.title}</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{topic.body}</p>
      <hr />
      {/* [Delete 기능]: filter를 사용하여 해당 id만 제외한 새 배열을 만들어 저장 */}
      <button onClick={() => {
        if (window.confirm('삭제할까요?')) {
          setTopics(topics.filter(t => t.id !== Number(id)));
          navigate('/'); // 삭제 완료 후 메인 화면으로 이동
        }
      }}>삭제</button>
    </article>
  );
}

/* [Create] 새 글 작성 컴포넌트 */
function Create() {
  const [topics, setTopics] = useAtom(topicsAtom);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    const title = e.target.title.value; // 입력받은 제목
    const body = e.target.body.value;   // 입력받은 내용
   
    // 고유한 ID 생성 (가장 큰 ID 값에 +1, 데이터가 없으면 1부터 시작)
    const nextId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 1;
   
    // [Create 기능]: 기존 배열에 새 객체를 추가하여 스토어 업데이트 (자동으로 로컬스토리지 저장됨)
    setTopics([...topics, { id: nextId, title, body }]);
    navigate(`/read/${nextId}`); // 작성 후 작성한 글로 즉시 이동
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

/* 전체 화면 구조 및 라우팅 설정 */
function MainContents() {
  const [topics] = useAtom(topicsAtom); // 목록을 보여주기 위해 스토어 읽기 전용으로 호출
 
  return (
    <Layout>
      <header>
        <h1><Link to="/" style={{ color: 'black' }}>WEB CRUD</Link></h1>
      </header>
     
      {/* 상단 내비게이션: 글 목록을 반복문(map)으로 출력 */}
      <NavList>
        {topics.map(t => (
          <li key={t.id}>
            <Link to={`/read/${t.id}`}>{t.title}</Link>
          </li>
        ))}
      </NavList>

      {/* URL 주소에 따라 바뀌는 화면 부분 */}
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

/* 7. 최상위 앱 컴포넌트 */
export default function App() {
  return (
    // HashRouter로 감싸 전체 앱에 라우팅 기능 부여
    <Router>
      <MainContents />
    </Router>
  );
}