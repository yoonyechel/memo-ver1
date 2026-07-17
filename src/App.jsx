import React, { useState, useEffect } from 'react';
import './App.css';

// 개별 메모 카드 컴포넌트
function MemoCard({ memo, onSave, onEdit, onDelete }) {
  const [tempTitle, setTempTitle] = useState(memo.title);
  const [tempContent, setTempContent] = useState(memo.content);
  
  // 편집 모드로 들어올 때 로컬 상태 동기화
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
          
          {/* 콘텐츠 영역 */}
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

          {/* 푸터 영역 */}
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
  // 로컬 스토리지에서 메모 불러오기
  const [memos, setMemos] = useState(() => {
    const saved = localStorage.getItem('memos-flow');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: '💡 MEMO FLOW에 오신 것을 환영합니다!',
        content: '이 앱은 부트스트랩(Bootstrap 5)과 글래스모피즘 디자인이 융합된 메모장입니다.\n\n오른쪽 상단의 [새 메모] 버튼을 누르면 새로운 메모를 생성하고 바로 입력할 수 있습니다.',
        colorIndex: 0,
        createdAt: new Date().toLocaleString('ko-KR', { hour12: false }),
        updatedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
        isEditing: false
      },
      {
        id: '2',
        title: '✨ 부트스트랩 디자인 적용 완료',
        content: '1. 반응형 카드 그리드 레이아웃을 제공합니다.\n2. 실시간 검색 기능을 제공하여 메모의 제목과 내용에서 빠르게 찾을 수 있습니다.\n3. 브라우저의 LocalStorage에 안전하게 자동 저장됩니다.',
        colorIndex: 1,
        createdAt: new Date().toLocaleString('ko-KR', { hour12: false }),
        updatedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
        isEditing: false
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');

  // memos 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('memos-flow', JSON.stringify(memos));
  }, [memos]);

  // 새 메모 추가
  const handleAddMemo = () => {
    const newMemo = {
      id: Date.now().toString(),
      title: '',
      content: '',
      colorIndex: Math.floor(Math.random() * 5),
      createdAt: new Date().toLocaleString('ko-KR', { hour12: false }),
      updatedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
      isEditing: true, // 즉시 편집 모드로 시작
    };

    // 다른 편집 중이던 메모는 자동으로 저장 모드 해제
    setMemos(prev => [
      newMemo,
      ...prev.map(m => m.isEditing ? { ...m, isEditing: false } : m)
    ]);
    
    // 새 메모 작성을 돕기 위해 검색어는 초기화
    setSearchTerm('');
  };

  // 메모 저장
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

  // 메모 수정 모드 진입
  const handleEditMemo = (id) => {
    setMemos(prev => prev.map(memo => {
      if (memo.id === id) {
        return { ...memo, isEditing: true };
      }
      return memo.isEditing ? { ...memo, isEditing: false } : memo;
    }));
  };

  // 메모 삭제
  const handleDeleteMemo = (id) => {
    if (window.confirm("이 메모를 삭제하시겠습니까?")) {
      setMemos(prev => prev.filter(memo => memo.id !== id));
    }
  };

  // 검색 필터링 적용
  const filteredMemos = memos.filter(memo => {
    const searchLower = searchTerm.toLowerCase();
    return (
      memo.title.toLowerCase().includes(searchLower) ||
      memo.content.toLowerCase().includes(searchLower)
    );
  });

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
