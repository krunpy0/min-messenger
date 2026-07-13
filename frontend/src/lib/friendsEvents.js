const FRIENDS_UPDATED_EVENT = "friends-updated";

export function emitFriendsUpdated(detail = {}) {
  window.dispatchEvent(
    new CustomEvent(FRIENDS_UPDATED_EVENT, {
      detail,
    })
  );
}

export function subscribeToFriendsUpdates(callback) {
  window.addEventListener(FRIENDS_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener(FRIENDS_UPDATED_EVENT, callback);
  };
}
