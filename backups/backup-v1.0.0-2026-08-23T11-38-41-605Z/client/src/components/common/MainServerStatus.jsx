import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useGetMainServerStatusQuery, useRefreshMainServerStatusMutation } from '../../store/api/api';

const POLL_INTERVAL = 15000;

const MainServerStatus = () => {
  const [dismissed, setDismissed] = useState(false);
  const prevOnline = useRef(null);
  const restoredNotified = useRef(false);

  const { data, isError, isFetching } = useGetMainServerStatusQuery(undefined, {
    pollingInterval: POLL_INTERVAL,
    refetchOnFocus: true
  });
  const [refresh, { isLoading: refreshing }] = useRefreshMainServerStatusMutation();

  const monitor = data?.monitor;
  const isDown = monitor?.online === false;

  // Notify (and un-dismiss) once when the connection is restored
  useEffect(() => {
    const wasDown = prevOnline.current === true;
    const nowDown = isDown === true;

    if (wasDown && !nowDown) {
      setDismissed(false);
      if (!restoredNotified.current) {
        restoredNotified.current = true;
        toast.success('Main server connection restored');
      }
    }

    if (nowDown) {
      restoredNotified.current = false;
    }

    prevOnline.current = nowDown;
  }, [isDown]);

  const showBanner = isDown && !dismissed && !isError;

  const handleRetry = async () => {
    try {
      await refresh().unwrap();
    } catch {
      /* keep banner visible */
    }
  };

  const lastOk = monitor?.lastOkAt ? new Date(monitor.lastOkAt).toLocaleTimeString() : null;
  const lastCheck = monitor?.checkedAt ? new Date(monitor.checkedAt).toLocaleTimeString() : null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed top-0 inset-x-0 z-[100] pointer-events-none"
        >
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 shadow-lg pointer-events-auto">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="relative flex h-3 w-3 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    Main Server is Down
                    <span className="text-[11px] font-normal bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {monitor?.reason || 'unreachable'}
                    </span>
                  </p>
                  <p className="text-xs text-red-50/90 mt-0.5 truncate">
                    {monitor?.error || 'The central update & license server could not be reached.'}
                  </p>
                  <p className="text-[11px] text-red-100/70 mt-0.5">
                    Only update & license monitoring is affected — login and all app data keep working normally.
                  </p>
                  <p className="text-[11px] text-red-100/70 mt-0.5">
                    Checking again automatically every {POLL_INTERVAL / 1000}s.
                    {lastOk && <span> Last reached at {lastOk}</span>}
                    {lastCheck && <span> • Last checked {lastCheck}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleRetry}
                  disabled={refreshing || isFetching}
                  className="px-3 py-1.5 rounded-lg bg-white text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {refreshing ? 'Checking...' : 'Retry Now'}
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MainServerStatus;