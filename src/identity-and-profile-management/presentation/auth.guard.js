export const authenticationGuard = (to) => {
    const storedUser = localStorage.getItem('livva-user');

    if (to.meta.requiresAuth && !storedUser) {
        return {
            name: 'login'
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