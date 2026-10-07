export const authenticationGuard = (to) => {
    const storedUser = localStorage.getItem('livva-user');
    const publicRoutes = new Set([
        'home',
        'about',
        'login',
        'register',
        'page-not-found'
    ]);
    const requiresAuthentication = !publicRoutes.has(to.name);

    if (requiresAuthentication && !storedUser) {
        return {
            name: 'login',
            query: {
                redirect: to.fullPath
            }
        };
    }

    if (
        (to.name === 'login' || to.name === 'register') &&
        storedUser
    ) {
        return {
            name: 'profile'
        };
    }

    return true;
};
