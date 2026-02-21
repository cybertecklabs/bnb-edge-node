module.exports = (allowedRoles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const rawRoles = req.user.roles ?? '';
    const userRolesStr = Array.isArray(rawRoles) ? rawRoles.join(',') : String(rawRoles);

    const userRoles = userRolesStr
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

    const hasRole = allowedRoles.some((r) => userRoles.includes(r));
    if (!hasRole) {
        return res
            .status(403)
            .json({ error: `Forbidden — requires: ${allowedRoles.join(', ')}` });
    }
    next();
};
