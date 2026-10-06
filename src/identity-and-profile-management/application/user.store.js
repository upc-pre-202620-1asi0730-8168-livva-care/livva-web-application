import { ref } from 'vue';
import { defineStore } from 'pinia';

import usersApi from '../infrastructure/users-api.js';
import userProfilesApi from '../infrastructure/user-profiles-api.js';

import { UserAssembler } from '../infrastructure/user.assembler.js';
import { UserProfileAssembler } from '../infrastructure/user-profile.assembler.js';

export const useUserStore = defineStore(
    'user-management',
    () => {
        const currentUser = ref(null);
        const currentProfile = ref(null);

        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        const register = async (userData) => {
            saving.value = true;
            error.value = null;

            try {
                const normalizedEmail = userData.email
                    .trim()
                    .toLowerCase();

                const existingUsers = await usersApi.getByEmail(
                    normalizedEmail
                );

                if (existingUsers.data.length > 0) {
                    error.value = 'auth.errors.emailAlreadyExists';
                    return null;
                }

                const now = new Date().toISOString();

                const resource = {
                    firstName: userData.firstName.trim(),
                    lastName: userData.lastName.trim(),
                    email: normalizedEmail,
                    passwordHash: userData.passwordHash,
                    phone: userData.phone.trim(),
                    role: 'CUSTOMER',
                    active: true,
                    createdAt: now,
                    updatedAt: now
                };

                const response = await usersApi.create(resource);
                return UserAssembler.toEntity(response.data);
            } catch {
                error.value = 'auth.errors.register';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const login = async (email, passwordHash) => {
            loading.value = true;
            error.value = null;

            try {
                const response = await usersApi.getByEmail(
                    email.trim().toLowerCase()
                );

                if (response.data.length === 0) {
                    error.value = 'auth.errors.invalidCredentials';
                    return false;
                }

                const user = UserAssembler.toEntity(response.data[0]);

                if (
                    user.passwordHash !== passwordHash ||
                    !user.active
                ) {
                    error.value = 'auth.errors.invalidCredentials';
                    return false;
                }

                currentUser.value = user;

                localStorage.setItem(
                    'livva-user',
                    JSON.stringify(user)
                );

                return true;
            } catch {
                error.value = 'auth.errors.login';
                return false;
            } finally {
                loading.value = false;
            }
        };

        const logout = () => {
            currentUser.value = null;
            currentProfile.value = null;

            localStorage.removeItem('livva-user');
        };

        const restoreSession = () => {
            const storedUser = localStorage.getItem('livva-user');

            if (!storedUser) return;

            try {
                currentUser.value = UserAssembler.toEntity(
                    JSON.parse(storedUser)
                );
            } catch {
                localStorage.removeItem('livva-user');
                currentUser.value = null;
            }
        };

        const fetchProfile = async (userId) => {
            loading.value = true;
            error.value = null;

            try {
                const response = await userProfilesApi.getByUserId(userId);

                if (response.data.length === 0) {
                    currentProfile.value = null;
                    return null;
                }

                currentProfile.value =
                    UserProfileAssembler.toEntity(response.data[0]);

                return currentProfile.value;
            } catch {
                error.value = 'profile.errors.load';
                return null;
            } finally {
                loading.value = false;
            }
        };

        const updateUser = async (userId, data) => {
            saving.value = true;
            error.value = null;

            try {
                const response = await usersApi.update(userId, {
                    ...data,
                    updatedAt: new Date().toISOString()
                });

                currentUser.value =
                    UserAssembler.toEntity(response.data);

                localStorage.setItem(
                    'livva-user',
                    JSON.stringify(currentUser.value)
                );

                return currentUser.value;
            } catch {
                error.value = 'profile.errors.update';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const saveProfile = async (userId, data) => {
            saving.value = true;
            error.value = null;

            try {
                const now = new Date().toISOString();

                if (currentProfile.value) {
                    const response = await userProfilesApi.update(
                        currentProfile.value.id,
                        {
                            ...data,
                            userId,
                            updatedAt: now
                        }
                    );

                    currentProfile.value =
                        UserProfileAssembler.toEntity(response.data);
                } else {
                    const response = await userProfilesApi.create({
                        ...data,
                        userId,
                        createdAt: now,
                        updatedAt: now
                    });

                    currentProfile.value =
                        UserProfileAssembler.toEntity(response.data);
                }

                return currentProfile.value;
            } catch {
                error.value = 'profile.errors.update';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const clearError = () => {
            error.value = null;
        };

        return {
            currentUser,
            currentProfile,
            loading,
            saving,
            error,
            register,
            login,
            logout,
            restoreSession,
            fetchProfile,
            updateUser,
            saveProfile,
            clearError
        };
    }
);
