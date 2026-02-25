import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { renderAvatar } from '@/helpers'
import { useState } from 'react'
import { Socket } from 'socket.io-client'
import { useRoomStore } from '@/hook/useRoomStore'
import { Player } from '@/types/player'
import { players } from '@/mock/init-player'
import { Input } from '@/components/ui/input'

export const MockPlayersComponent = ({
  socket,
  forceRender,
  setForceRender,
  handleSetMockPlayers,
}: {
  socket: Socket
  forceRender: boolean
  setForceRender: (forceRender: boolean) => void
  handleSetMockPlayers: (players: Player[]) => void
}) => {
  const [openDialog, setOpenDialog] = useState(false)

  const { username, roomCode, avatarKey, setRoomCode, setResetGame } =
    useRoomStore()

  const handleMockPlayers = () => {
    socket.emit(
      'rq_gm:createRoom',
      { avatarKey, username, roomCode },
      (data: { roomCode: string }) => {
        setOpenDialog(false)
        setForceRender(!forceRender)
        handleSetMockPlayers(players)
      },
    )
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 font-bold"
          aria-label="User info"
        >
          <span className="text-2xl">
            {renderAvatar({ username: 'GM', avatarKey: 1 })}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[320px] p-5">
        <DialogTitle className="sr-only">Mock players</DialogTitle>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Room code"
            />
            <button
              className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-bold text-white"
              onClick={handleMockPlayers}
            >
              Mock
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
