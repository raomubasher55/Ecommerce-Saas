exports.checkPackageValidity = (req, res, next) => {
    const { package } = req.user;
  
    if (!package || package.expiresAt < new Date()) {
      return next(
        new ApiError("Your subscription has expired. Please renew.", 403)
      );
    }
  
    next();
  };
   