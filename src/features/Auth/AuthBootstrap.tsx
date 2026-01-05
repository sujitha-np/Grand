import React, { useEffect } from 'react';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../config/constants';
import { useAppDispatch } from '../../state/hooks';
import { setTokenAndEmployee, setUser } from './authSlice';

export const AuthBootstrap: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      try {
        const token = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        const user = await storage.getItem<any>(STORAGE_KEYS.USER_DATA);
        const employeeId =
          user?.id ?? (await storage.getItem<number>('@employee_id'));

        if (!mounted) return;
        if (user) {
          dispatch(setUser(user));
        }
        dispatch(
          setTokenAndEmployee({
            token: token ?? null,
            employeeId: employeeId ?? null,
          })
        );
      } catch (e) {}
    };
    hydrate();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return null;
};

export default AuthBootstrap;
