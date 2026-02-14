export interface SavedAccount {
  userId: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}

const STORAGE_KEY = "kyc_saved_sessions";

const getAll = (): SavedAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persist = (accounts: SavedAccount[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

export const useSavedAccounts = () => {
  const saveAccount = (username: string, userId: string, accessToken: string, refreshToken: string) => {
    const accounts = getAll();
    const idx = accounts.findIndex((a) => a.userId === userId);
    const entry: SavedAccount = { userId, username, accessToken, refreshToken };
    if (idx >= 0) {
      accounts[idx] = entry;
    } else {
      accounts.push(entry);
    }
    persist(accounts);
  };

  const removeAccount = (userId: string) => {
    persist(getAll().filter((a) => a.userId !== userId));
  };

  const getSavedAccounts = (): SavedAccount[] => getAll();

  const getOtherAccounts = (currentUserId: string): SavedAccount[] =>
    getAll().filter((a) => a.userId !== currentUserId);

  return { saveAccount, removeAccount, getSavedAccounts, getOtherAccounts };
};
