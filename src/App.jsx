import React, { useState, useEffect } from 'react';
import './App.css';

// 개별 메모 카드 컴포넌트
function MemoCard({ memo, onSave, onEdit, onDelete }) {
  const [tempTitle, setTempTitle] = useState(memo.title);
  const [tempContent, setTempContent] = useState(memo.content);
  
  useEffect(() => {
    if (memo.isEditing) {
      setTempTitle(memo.title);
      setTempContent(memo.content);
    }
  }, [memo.isEditing, memo.title, memo.content]);

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget.parentElement?.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  };

  const handleSave = () => {
    onSave(memo.id, tempTitle, tempContent);
  };

  return (
    <div className="col-12 col-md-6 col-lg-4 animate-card">
      <div className={`card card-glass h-100 color-${memo.colorIndex} ${memo.isEditing ? 'editing' : ''}`}>
        <div className="card-body d-flex flex-column justify-content-between p-4">
          
          <div className="mb-4">
            {memo.isEditing ? (
              <>
                <input
                  type="text"
                  className="form-control form-glass card-title-input mb-3 fw-bold fs-5"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="메모 제목을 입력하세요..."
                  autoFocus
                  onKeyDown={handleTitleKeyDown}
                />
                <textarea
                  className="form-control form-glass memo-textarea"
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  placeholder="여기에 메모 내용을 적어보세요..."
                />
              </>
            ) : (
              <>
                <h5 className="card-title fw-bold mb-3" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {memo.title || "제목 없음"}
                </h5>
                <p className="card-text text-secondary-emphasis" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {memo.content || "내용 없음"}
                </p>
              </>
            )}
          </div>

          <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary-subtle">
            <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-clock"></i>
              {memo.updatedAt}
            </span>
            
            <div className="d-flex gap-2">
              {memo.isEditing ? (
                <button 
                  className="btn btn-sm btn-primary px-3 d-flex align-items-center gap-1" 
                  onClick={handleSave}
                  style={{ borderRadius: '8px' }}
                >
                  <i className="bi bi-check-circle-fill"></i>
                  <span>저장</span>
                </button>
              ) : (
                <>
                  <button 
                    className="btn btn-sm btn-outline-secondary px-3 d-flex align-items-center gap-1"
                    onClick={() => onEdit(memo.id)}
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-pencil-square"></i>
                    <span>수정</span>
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger px-3 d-flex align-items-center gap-1" 
                    onClick={() => onDelete(memo.id)}
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-trash3-fill"></i>
                    <span>삭제</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function App() {
  // --- [인증 및 가상 DB 상태 관리] ---
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users-flow');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('current-user-flow');
    return saved ? JSON.parse(saved) : null;
  });

  // 회원가입 및 로그인 폼 상태
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerId, setRegisterId] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- [메모 데이터 상태 관리] ---
  const [memos, setMemos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 유저 정보 변경 시 로컬스토리지 동기화
  useEffect(() => {
    localStorage.setItem('users-flow', JSON.stringify(users));
  }, [users]);

  // 로그인 상태 변경 시 로컬스토리지 동기화 및 회원별 메모 로드
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('current-user-flow', JSON.stringify(currentUser));
      // 로그인 유저 전용 가상 데이터베이스(메모) 로드
      const savedMemos = localStorage.getItem(`memos-flow_${currentUser.id}`);
      if (savedMemos) {
        setMemos(JSON.parse(savedMemos));
      } else {
        // 첫 로그인 시 기본 안내 템플릿 로드
        const defaultMemos = [
          {
            id: '1',
            title: `💡 ${currentUser.name}님의 MEMO FLOW에 오신 것을 환영합니다!`,
            content: '이 앱은 회원별로 개인 데이터베이스(LocalStorage)가 독립적으로 구성됩니다.\n\n오른쪽 상단의 [새 메모] 버튼을 누르면 새로운 메모를 생성하고 바로 입력할 수 있습니다.',
            colorIndex: 0,
            createdAt: new Date().toLocaleString('ko-KR', { hour12: false }),
            updatedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
            isEditing: false
          },
          {
            id: '2',
            title: '🔐 회원 맞춤형 기능 안내',
            content: '로그아웃 후 다른 아이디로 회원가입 및 로그인하면 완전히 다른 메모 리스트가 나타납니다.\n\n개인적인 정보와 아이디어를 안전하게 기록해 보세요.',
            colorIndex: 1,
            createdAt: new Date().toLocaleString('ko-KR', { hour12: false }),
            updatedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
            isEditing: false
          }
        ];
        setMemos(defaultMemos);
        localStorage.setItem(`memos-flow_${currentUser.id}`, JSON.stringify(defaultMemos));
      }
    } else {
      localStorage.removeItem('current-user-flow');
      setMemos([]);
    }
  }, [currentUser]);

  // 메모 내용 바뀔 때마다 유저별 데이터베이스에 자동 동기화
  useEffect(() => {
    if (currentUser && memos.length >= 0) {
      localStorage.setItem(`memos-flow_${currentUser.id}`, JSON.stringify(memos));
    }
  }, [memos, currentUser]);

  // --- [회원 기능 핸들러] ---
  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!registerId.trim() || !registerName.trim() || !registerPassword || !registerConfirmPassword) {
      setErrorMessage('모든 항목을 입력해 주세요.');
      return;
    }

    if (users.some(user => user.id === registerId.trim())) {
      setErrorMessage('이미 존재하는 아이디입니다.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    const newUser = {
      id: registerId.trim(),
      name: registerName.trim(),
      password: registerPassword
    };

    setUsers(prev => [...prev, newUser]);
    setSuccessMessage('회원가입이 완료되었습니다! 로그인해 주세요.');
    
    // 회원가입 폼 초기화
    setRegisterId('');
    setRegisterName('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    
    // 1.5초 후 로그인 화면으로 전환
    setTimeout(() => {
      setIsRegistering(false);
      setSuccessMessage('');
    }, 1500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!loginId.trim() || !loginPassword) {
      setErrorMessage('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    const user = users.find(u => u.id === loginId.trim() && u.password === loginPassword);

    if (!user) {
      setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    // 로그인 성공
    setCurrentUser({
      id: user.id,
      name: user.name
    });
    
    // 로그인 폼 초기화
    setLoginId('');
    setLoginPassword('');
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      setCurrentUser(null);
      setSearchTerm('');
    }
  };

  // --- [메모 기능 핸들러] ---
  const handleAddMemo = () => {
    if (!currentUser) return;
    
    const newMemo = {
      id: Date.now().toString(),
      title: '',
      content: '',
      colorIndex: Math.floor(Math.random() * 5),
      createdAt: new Date().toLocaleString('ko-KR', { hour12: false }),
      updatedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
      isEditing: true,
    };

    setMemos(prev => [
      newMemo,
      ...prev.map(m => m.isEditing ? { ...m, isEditing: false } : m)
    ]);
    setSearchTerm('');
  };

  const handleSaveMemo = (id, editedTitle, editedContent) => {
    setMemos(prev => prev.map(memo => {
      if (memo.id === id) {
        const finalTitle = editedTitle.trim() === '' && editedContent.trim() === '' 
          ? '빈 메모' 
          : editedTitle.trim();

        return {
          ...memo,
          title: finalTitle,
          content: editedContent,
          updatedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
          isEditing: false
        };
      }
      return memo;
    }));
  };

  const handleEditMemo = (id) => {
    setMemos(prev => prev.map(memo => {
      if (memo.id === id) {
        return { ...memo, isEditing: true };
      }
      return memo.isEditing ? { ...memo, isEditing: false } : memo;
    }));
  };

  const handleDeleteMemo = (id) => {
    if (window.confirm("이 메모를 삭제하시겠습니까?")) {
      setMemos(prev => prev.filter(memo => memo.id !== id));
    }
  };

  const filteredMemos = memos.filter(memo => {
    const searchLower = searchTerm.toLowerCase();
    return (
      memo.title.toLowerCase().includes(searchLower) ||
      memo.content.toLowerCase().includes(searchLower)
    );
  });

  // --- [뷰 렌더링 분기] ---
  if (!currentUser) {
    return (
      <div className="container d-flex align-items-center justify-content-center min-vh-100 py-5">
        <div className="card card-glass p-5 w-100 animate-card" style={{ maxWidth: '450px' }}>
          
          <div className="text-center mb-4">
            <i className="bi bi-journal-bookmark-fill fs-1 text-primary" style={{ filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))' }}></i>
            <h2 className="brand-gradient mt-2 mb-1">MEMO FLOW</h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>나만의 생각과 계획을 기록하고 보관하세요.</p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 px-3 mb-3 border-0 rounded-3 text-center" style={{ fontSize: '0.85rem', background: 'rgba(220, 53, 69, 0.15)', color: '#f87171' }}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success py-2 px-3 mb-3 border-0 rounded-3 text-center" style={{ fontSize: '0.85rem', background: 'rgba(25, 135, 84, 0.15)', color: '#34d399' }}>
              <i className="bi bi-check-circle-fill me-2"></i>
              {successMessage}
            </div>
          )}

          {!isRegistering ? (
            // --- 로그인 폼 ---
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small">아이디</label>
                <div className="input-group">
                  <span className="input-group-text form-glass border-end-0"><i className="bi bi-person-fill text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control form-glass border-start-0"
                    placeholder="아이디를 입력하세요"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold small">비밀번호</label>
                <div className="input-group">
                  <span className="input-group-text form-glass border-end-0"><i className="bi bi-lock-fill text-muted"></i></span>
                  <input
                    type="password"
                    className="form-control form-glass border-start-0"
                    placeholder="비밀번호를 입력하세요"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2.5 fw-bold mb-3 shadow" style={{ borderRadius: '12px' }}>
                로그인
              </button>

              <div className="text-center mt-3">
                <span className="text-secondary small">아직 회원이 아니신가요? </span>
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none"
                  onClick={() => {
                    setIsRegistering(true);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  회원가입
                </button>
              </div>
            </form>
          ) : (
            // --- 회원가입 폼 ---
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small">아이디</label>
                <div className="input-group">
                  <span className="input-group-text form-glass border-end-0"><i className="bi bi-person-plus-fill text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control form-glass border-start-0"
                    placeholder="사용할 아이디"
                    value={registerId}
                    onChange={(e) => setRegisterId(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small">이름</label>
                <div className="input-group">
                  <span className="input-group-text form-glass border-end-0"><i className="bi bi-card-text text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control form-glass border-start-0"
                    placeholder="사용자 이름"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small">비밀번호</label>
                <div className="input-group">
                  <span className="input-group-text form-glass border-end-0"><i className="bi bi-lock-fill text-muted"></i></span>
                  <input
                    type="password"
                    className="form-control form-glass border-start-0"
                    placeholder="비밀번호"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold small">비밀번호 확인</label>
                <div className="input-group">
                  <span className="input-group-text form-glass border-end-0"><i className="bi bi-shield-lock-fill text-muted"></i></span>
                  <input
                    type="password"
                    className="form-control form-glass border-start-0"
                    placeholder="비밀번호 확인"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2.5 fw-bold mb-3 shadow" style={{ borderRadius: '12px' }}>
                가입하기
              </button>

              <div className="text-center mt-3">
                <span className="text-secondary small">이미 계정이 있으신가요? </span>
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none"
                  onClick={() => {
                    setIsRegistering(false);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  로그인으로 이동
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // --- 로그인 이후 메인 화면 ---
  return (
    <div className="container py-5">
      {/* 헤더 영역 */}
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 pb-4 mb-5 border-bottom border-secondary-subtle">
        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-journal-bookmark-fill fs-1 text-primary" style={{ filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))' }}></i>
          <h1 className="h2 brand-gradient m-0">MEMO FLOW</h1>
        </div>
        
        <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3 w-100 w-md-auto">
          {/* 검색 바 */}
          <div className="input-group" style={{ maxWidth: '350px' }}>
            <span className="input-group-text form-glass border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control form-glass border-start-0"
              placeholder="메모 제목 또는 내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 새 메모 버튼 */}
          <button 
            className="btn btn-primary px-4 py-2 d-flex align-items-center justify-content-center gap-2 shadow" 
            onClick={handleAddMemo}
            style={{ borderRadius: '12px', fontWeight: '600' }}
          >
            <i className="bi bi-plus-lg fs-5"></i>
            <span>새 메모</span>
          </button>
          
          {/* 회원 프로필 & 로그아웃 영역 */}
          <div className="d-flex align-items-center justify-content-between gap-3 px-3 py-2 card-glass ms-0 ms-sm-2" style={{ borderRadius: '12px' }}>
            <span className="text-secondary-emphasis fw-semibold small d-flex align-items-center gap-1.5">
              <i className="bi bi-person-circle text-primary"></i>
              <span>{currentUser.name}님</span>
            </span>
            <button 
              className="btn btn-sm btn-outline-danger px-2.5 py-1 d-flex align-items-center gap-1"
              onClick={handleLogout}
              style={{ borderRadius: '8px', fontSize: '0.8rem' }}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* 본문 영역 */}
      <main>
        {filteredMemos.length > 0 ? (
          <div className="row g-4 justify-content-start">
            {filteredMemos.map(memo => (
              <MemoCard
                key={memo.id}
                memo={memo}
                onSave={handleSaveMemo}
                onEdit={handleEditMemo}
                onDelete={handleDeleteMemo}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-5 px-4 card-glass mx-auto empty-icon-pulse" style={{ maxWidth: '520px', borderRadius: '24px' }}>
            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-4" style={{ width: '70px', height: '70px' }}>
              <i className={`bi ${searchTerm ? 'bi-journal-x' : 'bi-journal-plus'} fs-2`}></i>
            </div>
            <h3 className="fw-bold mb-2">
              {searchTerm ? "검색 결과가 없습니다" : "메모가 비어 있습니다"}
            </h3>
            <p className="text-secondary mb-4 px-3" style={{ fontSize: '0.9rem' }}>
              {searchTerm 
                ? `'${searchTerm}'에 매칭되는 메모를 찾을 수 없습니다. 다른 키워드로 검색해 보세요.`
                : "첫 번째 메모를 추가하고 자유롭게 생각과 계획을 기록해 보세요!"}
            </p>
            {!searchTerm && (
              <button 
                className="btn btn-primary px-4 py-2" 
                onClick={handleAddMemo}
                style={{ borderRadius: '10px', fontWeight: '500' }}
              >
                <i className="bi bi-plus-lg me-2"></i>
                <span>첫 메모 추가하기</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
