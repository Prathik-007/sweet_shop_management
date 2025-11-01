module.exports = function (req, res, next) {
  // Check if user is authenticated (from previous auth middleware)
  if (!req.user) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Check if user role is 'Admin'
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Access denied. Admin role required.' }); // 403 Forbidden
  }

  // If user is Admin, proceed
  next();
};