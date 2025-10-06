// Middleware to check for 'admin' role
export const isAdmin = (req, res, next) => {
    // console.log(req.user);
    if (req.user && req.user.role === 'admin') {
        return next();
    } else {
        console.log()
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
};

// Middleware check for 'dealer' role
export const isDealer = (req, res, next) => {
    if (req.user && req.user.role === 'dealer') {
        return next();
    } else {
        return res.status(403).json({ message: "Access denied. Dealers only." });
    }
};

// Middleware to check for 'user' role
export const isUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        return next();
    } else {
        return res.status(403).json({ message: "Access denied. User only." });
    }
};