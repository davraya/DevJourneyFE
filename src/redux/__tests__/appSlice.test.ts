import appSlice, { updateUserId, login, logout, clearAllData } from '../appSlice';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('appSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = appSlice(undefined, { type: 'unknown' });
      
      expect(state.userId).toBe('');
      expect(state.loggedIn).toBe(false);
      expect(state.jwtToken).toBeNull();
    });

    it('should have jwtToken as null when no token in localStorage', () => {
      // Test that initial state has null jwtToken when localStorage is empty
      const state = appSlice(undefined, { type: 'unknown' });
      
      expect(state.jwtToken).toBeNull();
    });
  });

  describe('updateUserId', () => {
    it('should update userId', () => {
      const initialState = appSlice(undefined, { type: 'unknown' });
      const newUserId = 'user123';
      
      const state = appSlice(initialState, updateUserId(newUserId));
      
      expect(state.userId).toBe(newUserId);
      expect(state.loggedIn).toBe(initialState.loggedIn);
    });
  });

  describe('login', () => {
    it('should set loggedIn to true and store jwtToken', () => {
      const initialState = appSlice(undefined, { type: 'unknown' });
      const token = 'jwt-token-123';
      
      const state = appSlice(initialState, login(token));
      
      expect(state.loggedIn).toBe(true);
      expect(state.jwtToken).toBe(token);
      expect(state.userId).toBe(initialState.userId);
    });
  });

  describe('logout', () => {
    it('should reset loggedIn, jwtToken, userId and clear localStorage', () => {
      const initialState = {
        userId: 'user123',
        loggedIn: true,
        jwtToken: 'jwt-token-123',
      };
      
      const state = appSlice(initialState, logout());
      
      expect(state.loggedIn).toBe(false);
      expect(state.jwtToken).toBeNull();
      expect(state.userId).toBe('');
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userId');
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('clearAllData', () => {
    it('should reset all state to initial values and clear localStorage', () => {
      const initialState = {
        userId: 'user123',
        loggedIn: true,
        jwtToken: 'jwt-token-123',
      };
      
      const state = appSlice(initialState, clearAllData());
      
      expect(state.loggedIn).toBe(false);
      expect(state.jwtToken).toBeNull();
      expect(state.userId).toBe('');
      
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });
});
