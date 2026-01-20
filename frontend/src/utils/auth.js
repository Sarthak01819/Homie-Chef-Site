export const isLoggedIn = () => {
  return Boolean(localStorage.getItem("authUser"));
};

export const loginUser = (user) => {
  localStorage.setItem("authUser", JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem("authUser");
};
