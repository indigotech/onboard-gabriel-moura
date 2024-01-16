export const validateStrongPassword = (password: string): boolean => {
  const strongPassword = new RegExp('(?=.*[0-9]+)(?=.*[A-Za-z]+).{6,}');
  const match = strongPassword.test(password);
  return match;
};
