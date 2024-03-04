export const noCache = (req, res, next) => {
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    next();
};