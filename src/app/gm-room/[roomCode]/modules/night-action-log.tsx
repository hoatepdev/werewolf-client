import type { NightActionData } from './types'

export const NightActionLog = ({
  nightActions,
}: {
  nightActions: NightActionData[]
}) => (
  <div className="mt-6 rounded-lg p-6">
    <h2 className="mb-4 text-lg font-bold text-blue-400">
      🌙 Nhật ký hành động đêm
    </h2>
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {nightActions.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có hành động đêm nào...</p>
      ) : (
        nightActions.map((action, index) => (
          <div key={index} className="rounded bg-gray-700 p-3">
            <p className="text-sm font-medium text-white">{action.message}</p>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(action.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
)
