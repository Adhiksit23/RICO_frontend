'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IotService, type IotSyncStatus } from '@/services/iot.service';
import { useAuthStore } from '@/store/authStore';
import { formatIstDateTime } from '@/lib/datetime';

export default function IotSyncPanel() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'plant_admin';
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['iot', 'status'],
    queryFn: () => IotService.status(),
    enabled: !!user,
    refetchInterval: 15_000,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['iot', 'status'] });

  const startMutation = useMutation({
    mutationFn: () => IotService.start(),
    onSuccess: invalidate,
  });
  const stopMutation = useMutation({
    mutationFn: () => IotService.stop(),
    onSuccess: invalidate,
  });
  const runNowMutation = useMutation({
    mutationFn: () => IotService.runNow(),
    onSuccess: invalidate,
  });

  const busy =
    startMutation.isPending ||
    stopMutation.isPending ||
    runNowMutation.isPending;

  const status: IotSyncStatus | undefined = data;
  const running = status?.running ?? false;
  const lastStatus = status?.last_result?.status;
  const lastError = status?.last_result?.error;

  const actionError =
    (startMutation.error as { response?: { data?: { detail?: string } } } | null)
      ?.response?.data?.detail ||
    (stopMutation.error as { response?: { data?: { detail?: string } } } | null)
      ?.response?.data?.detail ||
    (runNowMutation.error as { response?: { data?: { detail?: string } } } | null)
      ?.response?.data?.detail ||
    null;

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-[#0B1120]/80 p-4 sm:p-5 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
              IoT Sync Scheduler
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                running
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  running ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                }`}
              />
              {running ? 'Running' : 'Stopped'}
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
            Sync runs on the server every {status?.interval_seconds ?? 60}s.
            Closing the browser or logging out does not stop it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Refresh
          </button>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => startMutation.mutate()}
                disabled={busy || running}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {startMutation.isPending ? 'Starting…' : 'Start'}
              </button>
              <button
                type="button"
                onClick={() => stopMutation.mutate()}
                disabled={busy || !running}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/90 text-white hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {stopMutation.isPending ? 'Stopping…' : 'Stop'}
              </button>
              <button
                type="button"
                onClick={() => runNowMutation.mutate()}
                disabled={busy}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-40"
              >
                {runNowMutation.isPending ? 'Syncing…' : 'Run now'}
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading && (
        <p className="text-gray-500 text-xs mt-4">Loading sync status…</p>
      )}

      {error && (
        <p className="text-rose-400 text-xs mt-4">
          Could not load IoT status. Sign in again if your session expired.
        </p>
      )}

      {actionError && (
        <p className="text-rose-400 text-xs mt-3">{String(actionError)}</p>
      )}

      {status && (
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-black/30 border border-gray-800 px-3 py-2.5">
            <dt className="text-gray-500 font-medium">Last run</dt>
            <dd className="text-gray-200 mt-0.5 font-semibold">
              {formatIstDateTime(status.last_run_at)}
            </dd>
          </div>
          <div className="rounded-xl bg-black/30 border border-gray-800 px-3 py-2.5">
            <dt className="text-gray-500 font-medium">Next run</dt>
            <dd className="text-gray-200 mt-0.5 font-semibold">
              {running ? formatIstDateTime(status.next_run_at) : '—'}
            </dd>
          </div>
          <div className="rounded-xl bg-black/30 border border-gray-800 px-3 py-2.5">
            <dt className="text-gray-500 font-medium">Last result</dt>
            <dd
              className={`mt-0.5 font-semibold ${
                lastStatus === 'ok'
                  ? 'text-emerald-400'
                  : lastStatus === 'error'
                    ? 'text-rose-400'
                    : 'text-gray-200'
              }`}
            >
              {lastStatus ?? '—'}
              {lastError ? ` — ${lastError}` : ''}
            </dd>
          </div>
          <div className="rounded-xl bg-black/30 border border-gray-800 px-3 py-2.5">
            <dt className="text-gray-500 font-medium">Last controlled by</dt>
            <dd className="text-gray-200 mt-0.5 font-semibold truncate">
              {status.updated_by ?? '—'}
            </dd>
          </div>
        </dl>
      )}

      {!isAdmin && (
        <p className="text-gray-500 text-[11px] mt-3">
          Only Plant Admins can start or stop the scheduler.
        </p>
      )}
    </section>
  );
}
