'use client'
import MainLayout from '@/components/MainLayout'
import PageHeader from '@/components/PageHeader'
import { LIST_ROLE } from '@/constants/role'

const PHASES = [
  { emoji: '🌙', name: 'Đêm', desc: 'Các vai trò đặc biệt hành động theo thứ tự' },
  { emoji: '☀️', name: 'Ngày', desc: 'Cả làng thảo luận về ai là Sói' },
  { emoji: '🗳️', name: 'Bỏ phiếu', desc: 'Bỏ phiếu loại người bị nghi ngờ' },
  { emoji: '⚖️', name: 'Kết thúc lượt', desc: 'Kiểm tra điều kiện thắng' },
]

const WIN_CONDITIONS = [
  {
    emoji: '🧑‍🌾',
    faction: 'Dân làng',
    condition: 'Loại bỏ hết tất cả Sói khỏi làng',
  },
  {
    emoji: '🐺',
    faction: 'Sói',
    condition: 'Số Sói bằng hoặc vượt số dân làng còn sống',
  },
  {
    emoji: '😵',
    faction: 'Chán đời',
    condition: 'Bị cả làng bỏ phiếu chết trong pha ban ngày / bỏ phiếu',
  },
]

export default function GuidePage() {
  return (
    <MainLayout>
      <PageHeader title="Hướng dẫn" />
      <div className="flex flex-col gap-8 pb-8">
        {/* Luật chơi cơ bản */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-yellow-400">Luật chơi cơ bản</h2>
          <div className="rounded-xl bg-zinc-800 p-4 text-sm leading-relaxed text-zinc-200">
            <p>
              Làng có những người dân vô tội và một nhóm{' '}
              <span className="font-semibold text-white">Sói</span> ẩn náu bên
              trong. Ban đêm, Sói thức dậy và chọn một người để loại. Ban ngày,
              cả làng thảo luận và{' '}
              <span className="font-semibold text-white">bỏ phiếu</span> để loại
              kẻ tình nghi.
            </p>
            <p className="mt-2">
              Quản trò (GM) điều phối trò chơi — không tham gia bỏ phiếu hay hành
              động đêm.
            </p>
          </div>
        </section>

        {/* Các pha trong game */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-yellow-400">Các pha trong game</h2>
          <div className="flex flex-col gap-2">
            {PHASES.map((phase, idx) => (
              <div key={phase.name} className="flex items-start gap-3 rounded-xl bg-zinc-800 p-4">
                <span className="mt-0.5 text-2xl leading-none">{phase.emoji}</span>
                <div>
                  <p className="font-semibold text-white">
                    {idx + 1}. {phase.name}
                  </p>
                  <p className="text-sm text-zinc-400">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vai trò */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-yellow-400">Vai trò</h2>
          <div className="flex flex-col gap-2">
            {LIST_ROLE.map((role) => (
              <div key={role.id} className="flex items-start gap-3 rounded-xl bg-zinc-800 p-4">
                <span className="mt-0.5 text-2xl leading-none">{role.emoji}</span>
                <div>
                  <p className="font-semibold text-white">{role.name}</p>
                  <p className="text-sm text-zinc-400">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Điều kiện thắng */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-yellow-400">Điều kiện thắng</h2>
          <div className="flex flex-col gap-2">
            {WIN_CONDITIONS.map((wc) => (
              <div key={wc.faction} className="flex items-start gap-3 rounded-xl bg-zinc-800 p-4">
                <span className="mt-0.5 text-2xl leading-none">{wc.emoji}</span>
                <div>
                  <p className="font-semibold text-white">{wc.faction}</p>
                  <p className="text-sm text-zinc-400">{wc.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
