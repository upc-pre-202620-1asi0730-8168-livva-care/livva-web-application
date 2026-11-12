import { ref } from 'vue';
import { defineStore } from 'pinia';

import usersApi from '../infrastructure/users-api.js';
import authenticationApi from '../infrastructure/authentication-api.js';
import authToken from '../../shared/infrastructure/auth-token.js';
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
                const resource = {
                    firstName: userData.firstName.trim(),
                    lastName: userData.lastName.trim(),
                    email: userData.email.trim().toLowerCase(),
                    password: userData.password,
                    phone: userData.phone?.trim() || null
                };

                const response = await authenticationApi.signUp(resource);
                return UserAssembler.toEntity(response.data);
            } catch (requestError) {
                error.value = requestError?.response?.status === 409
                    ? 'auth.errors.emailAlreadyExists'
                    : 'auth.errors.register';
                return null;
            } finally {
                saving.value = false;
            }
        };

        const login = async (email, password) => {
            loading.value = true;
            error.value = null;

            try {
                const response = await authenticationApi.signIn({
                    email: email.trim().toLowerCase(),
                    password
                });

                const { token, ...userResource } = response.data;
                const user = UserAssembler.toEntity(userResource);

                authToken.set(token);
                currentUser.value = user;

                localStorage.setItem(
                    'livva-user',
                    JSON.stringify(user)
                );

                return true;
            } catch (requestError) {
                error.value = requestError?.response?.status === 401
                    ? 'auth.errors.invalidCredentials'
                    : 'auth.errors.login';
                return false;
            } finally {
                loading.value = false;
            }
        };

        const logout = () => {
            currentUser.value = null;
            currentProfile.value = null;

            localStorage.removeItem('livva-user');
            authToken.clear();
        };

        const restoreSession = () => {
            const storedUser = localStorage.getItem('livva-user');

            if (!storedUser || !authToken.get()) {
                localStorage.removeItem('livva-user');
                authToken.clear();
                return;
            }

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
