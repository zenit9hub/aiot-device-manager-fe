/**
 * Firebase Todo Application
 * 
 * Firebase 인증과 Firestore를 활용한 실시간 Todo 애플리케이션입니다.
 * 
 * Features:
 * - Email/Password Authentication
 * - Google OAuth Authentication
 * - Real-time Todo CRUD operations
 * - User-specific Todo management
 * - Todo filtering and completion tracking
 */

// Firebase SDK imports for authentication and Firestore
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from './config/firebase.config';

// Initialize Firebase application
try {
  console.log('Firebase config:', firebaseConfig);
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Global variables for todo management
  let currentUser = null;
  let todos = [];
  let currentFilter = 'all';
  let unsubscribeTodos = null;

  /**
   * Display user information and toggle UI sections
   * 사용자 정보를 표시하고 UI 섹션을 전환하는 함수
   * 
   * @param {Object} user - Firebase user object containing auth details
   */
  function displayUserInfo(user) {
    console.log('User state changed:', user);
    const authSection = document.getElementById("auth-section");
    const todoSection = document.getElementById("todo-section");
    const userInfoElement = document.getElementById("user-info");
    const userEmailElement = document.getElementById("user-email");
    
    if (user) {
      currentUser = user;
      authSection.classList.add('hidden');
      todoSection.classList.remove('hidden');
      userInfoElement.textContent = `로그인됨: ${user.email}`;
      if (userEmailElement) {
        userEmailElement.textContent = user.email;
      }
      setupTodoListeners();
    } else {
      currentUser = null;
      authSection.classList.remove('hidden');
      todoSection.classList.add('hidden');
      userInfoElement.textContent = "Not logged in";
      if (unsubscribeTodos) {
        unsubscribeTodos();
        unsubscribeTodos = null;
      }
    }
  }

  /**
   * Set up real-time todo listeners
   * 실시간 todo 리스너 설정
   */
  function setupTodoListeners() {
    if (!currentUser || unsubscribeTodos) return;
    
    console.log('Setting up todo listeners for user:', currentUser.uid);
    const todosQuery = query(
      collection(db, 'todos'),
      where('userId', '==', currentUser.uid)
    );
    
    unsubscribeTodos = onSnapshot(todosQuery, (snapshot) => {
      console.log('Firestore snapshot received, docs count:', snapshot.size);
      todos = [];
      snapshot.forEach((doc) => {
        const todoData = { id: doc.id, ...doc.data() };
        console.log('Todo data:', todoData);
        todos.push(todoData);
      });
      // Sort by createdAt in JavaScript since we removed orderBy from query
      todos.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      console.log('All todos loaded and sorted:', todos);
      renderTodos();
      updateTodoCount();
    });
  }

  /**
   * Add a new todo
   * 새 할 일 추가
   * 
   * @param {string} text - Todo text
   */
  async function addTodo(text) {
    if (!currentUser || !text.trim()) return;
    
    try {
      await addDoc(collection(db, 'todos'), {
        text: text.trim(),
        completed: false,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('할 일 추가 중 오류가 발생했습니다.');
    }
  }

  /**
   * Toggle todo completion status
   * 할 일 완료 상태 토글
   * 
   * @param {string} todoId - Todo document ID
   * @param {boolean} completed - New completion status
   */
  async function toggleTodo(todoId, completed) {
    try {
      await updateDoc(doc(db, 'todos', todoId), {
        completed: completed
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('할 일 수정 중 오류가 발생했습니다.');
    }
  }

  /**
   * Delete a todo
   * 할 일 삭제
   * 
   * @param {string} todoId - Todo document ID
   */
  async function deleteTodo(todoId) {
    try {
      await deleteDoc(doc(db, 'todos', todoId));
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('할 일 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * Clear all completed todos
   * 완료된 모든 할 일 삭제
   */
  async function clearCompleted() {
    const completedTodos = todos.filter(todo => todo.completed);
    
    try {
      await Promise.all(
        completedTodos.map(todo => deleteDoc(doc(db, 'todos', todo.id)))
      );
    } catch (error) {
      console.error('Error clearing completed todos:', error);
      alert('완료된 할 일 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * Render todos based on current filter
   * 현재 필터에 따라 할 일 렌더링
   */
  function renderTodos() {
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    if (!todoList) return;
    
    let filteredTodos = todos;
    if (currentFilter === 'active') {
      filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
      filteredTodos = todos.filter(todo => todo.completed);
    }
    
    // Show/hide empty state
    if (filteredTodos.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      todoList.innerHTML = `
        <div id="empty-state" class="text-center py-12 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <p>${currentFilter === 'active' ? '진행중인 할 일이 없습니다.' : 
               currentFilter === 'completed' ? '완료된 할 일이 없습니다.' : 
               '아직 할 일이 없습니다.'}</p>
          <p class="text-sm mt-1">${currentFilter === 'all' ? '위에서 새로운 할 일을 추가해보세요!' : ''}</p>
        </div>
      `;
    } else {
      if (emptyState) {
        emptyState.style.display = 'none';
      }
      todoList.innerHTML = filteredTodos.map((todo, index) => `
        <div class="todo-item ${todo.completed ? 'completed' : ''} fade-in" data-id="${todo.id}" style="animation-delay: ${index * 0.05}s">
          <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''} 
            onchange="toggleTodo('${todo.id}', this.checked)"
          />
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <div class="todo-actions">
            <button class="todo-delete" onclick="deleteTodo('${todo.id}')" title="할 일 삭제">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * Escape HTML to prevent XSS
   * HTML 이스케이프로 XSS 방지
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  /**
   * Update todo count display
   * 할 일 개수 표시 업데이트
   */
  function updateTodoCount() {
    const todoCount = document.getElementById('todo-count');
    const activeCount = document.getElementById('active-count');
    const completedCount = document.getElementById('completed-count');
    
    const activeTodos = todos.filter(todo => !todo.completed).length;
    const completedTodos = todos.filter(todo => todo.completed).length;
    const totalTodos = todos.length;
    
    if (todoCount) {
      todoCount.textContent = `총 ${totalTodos}개의 할 일`;
    }
    
    if (activeCount) {
      activeCount.textContent = `${activeTodos}개 진행중`;
    }
    
    if (completedCount) {
      completedCount.textContent = `${completedTodos}개 완료`;
    }
  }

  /**
   * Set current filter and update UI
   * 현재 필터 설정 및 UI 업데이트
   * 
   * @param {string} filter - Filter type: 'all', 'active', 'completed'
   */
  function setFilter(filter) {
    currentFilter = filter;
    
    // Update filter button styles
    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    renderTodos();
  }

  // Make functions globally available
  window.toggleTodo = toggleTodo;
  window.deleteTodo = deleteTodo;
  window.setFilter = setFilter;

  // Set up real-time auth state observer
  // 실시간 인증 상태 변경 감지 설정
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user);
    displayUserInfo(user);
  });

  // DOM Content Loaded Event Handler
  document.addEventListener('DOMContentLoaded', () => {
    // Todo app event listeners
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    // Add todo on button click or Enter key
    addTodoBtn?.addEventListener('click', () => {
      const text = todoInput.value.trim();
      if (text) {
        addTodo(text);
        todoInput.value = '';
      }
    });
    
    todoInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = todoInput.value.trim();
        if (text) {
          addTodo(text);
          todoInput.value = '';
        }
      }
    });
    
    // Clear completed todos
    clearCompletedBtn?.addEventListener('click', clearCompleted);
    
    // Filter button event listeners
    document.getElementById('filter-all')?.addEventListener('click', () => setFilter('all'));
    document.getElementById('filter-active')?.addEventListener('click', () => setFilter('active'));
    document.getElementById('filter-completed')?.addEventListener('click', () => setFilter('completed'));
    
    // Header logout button
    document.getElementById('header-logout')?.addEventListener('click', async () => {
      try {
        await signOut(auth);
        console.log("Successfully signed out from header");
      } catch (error) {
        console.error("Header sign out error:", error);
        alert("Error: " + error.message);
      }
    });
    /**
     * Email/Password Login Handler
     * 이메일/비밀번호 로그인 처리
     * 
     * @throws {FirebaseAuthError} When authentication fails
     */
    document.getElementById("email-login").addEventListener("click", async () => {
      try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log("Email sign in success:", result.user);
        alert("Successfully signed in!");
      } catch (error) {
        console.error("Email sign in error:", error);
        alert("Error: " + error.message);
      }
    });

    /**
     * Email/Password Registration Handler
     * 신규 사용자 등록 처리
     * 
     * @throws {FirebaseAuthError} When registration fails
     */
    document.getElementById("email-signup").addEventListener("click", async () => {
      try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Email sign up success:", result.user);
        alert("Successfully signed up!");
      } catch (error) {
        console.error("Email sign up error:", error);
        alert("Error: " + error.message);
      }
    });

    /**
     * Google OAuth Login Handler
     * 구글 소셜 로그인 처리
     * 
     * @throws {FirebaseAuthError} When Google sign-in fails
     */
    document.getElementById("google-login").addEventListener("click", async () => {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log("Google sign in success:", result.user);
        alert("Successfully signed in with Google!");
      } catch (error) {
        console.error("Google sign in error:", error);
        alert("Error: " + error.message);
      }
    });

    /**
     * Logout Handler
     * 로그아웃 처리
     * 
     * @throws {FirebaseAuthError} When sign-out fails
     */
    document.getElementById("logout").addEventListener("click", async () => {
      try {
        await signOut(auth);
        console.log("Successfully signed out");
        alert("Successfully signed out!");
      } catch (error) {
        console.error("Sign out error:", error);
        alert("Error: " + error.message);
      }
    });
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
}
