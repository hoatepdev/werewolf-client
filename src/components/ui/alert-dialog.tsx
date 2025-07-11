'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

import { cn } from '@/lib/utils'

// Utility hook for programmatic dialogs
import { useState, useCallback, useRef, useEffect } from 'react'

import { createContext, useContext } from 'react'
import { buttonVariants } from './button'

export type AlertDialogType = 'alert' | 'confirm' | 'warning'

export interface ProgrammaticDialogOptions {
  type?: AlertDialogType
  title?: React.ReactNode
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export function useProgrammaticDialog() {
  const [open, setOpen] = useState<boolean>(false)
  const [options, setOptions] = useState<ProgrammaticDialogOptions>(
    {} as ProgrammaticDialogOptions,
  )
  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined)

  const showDialog = useCallback((opts: ProgrammaticDialogOptions) => {
    setOptions(opts)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setOpen(false)
    options.onConfirm?.()
    if (resolveRef.current) resolveRef.current(true)
  }, [options])

  const handleCancel = useCallback(() => {
    setOpen(false)
    options.onCancel?.()
    if (resolveRef.current) resolveRef.current(false)
  }, [options])

  useEffect(() => {
    if (!open) {
      resolveRef.current = undefined
    }
  }, [open])

  const DialogComponent = (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {options.title ||
              (options.type === 'confirm'
                ? 'Bạn có chắc chắn?'
                : options.type === 'warning'
                  ? 'Cảnh báo'
                  : 'Thông báo')}
          </AlertDialogTitle>
          {options.description && (
            <AlertDialogDescription>
              {options.description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {options.type === 'confirm' || options.type === 'warning' ? (
            <>
              <AlertDialogCancel onClick={handleCancel}>
                {options.cancelText || 'Hủy'}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                {options.confirmText ||
                  (options.type === 'warning' ? 'Tiếp tục' : 'Đồng ý')}
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={handleConfirm}>
              {options.confirmText || 'Đồng ý'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { showDialog, DialogComponent }
}

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        'mb-4 flex flex-col gap-2 text-center sm:text-left',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'flex justify-center gap-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(
        buttonVariants({ variant: 'yellow' }),
        'text-base',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(
        buttonVariants({ variant: 'black' }),
        'text-base',
        className,
      )}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

interface ProgrammaticDialogContextType {
  showDialog: (opts: ProgrammaticDialogOptions) => Promise<boolean>
}

const ProgrammaticDialogContext = createContext<
  ProgrammaticDialogContextType | undefined
>(undefined)

export function ProgrammaticDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const dialog = useProgrammaticDialog()
  return (
    <ProgrammaticDialogContext.Provider
      value={{ showDialog: dialog.showDialog }}
    >
      {children}
      {dialog.DialogComponent}
    </ProgrammaticDialogContext.Provider>
  )
}

export function useDialogContext() {
  const ctx = useContext(ProgrammaticDialogContext)
  if (!ctx)
    throw new Error(
      'useDialogContext must be used within ProgrammaticDialogProvider',
    )
  return ctx
}

export function alertDialog(options: Omit<ProgrammaticDialogOptions, 'type'>) {
  const ctx = getDialogSingleton()
  return ctx.showDialog({ ...options, type: 'alert' })
}

export function confirmDialog(
  options: Omit<ProgrammaticDialogOptions, 'type'>,
) {
  const ctx = getDialogSingleton()
  return ctx.showDialog({ ...options, type: 'confirm' })
}

export function warningDialog(
  options: Omit<ProgrammaticDialogOptions, 'type'>,
) {
  const ctx = getDialogSingleton()
  return ctx.showDialog({ ...options, type: 'warning' })
}

// Singleton context for programmatic dialogs
let dialogSingleton: ProgrammaticDialogContextType | null = null
function setDialogSingleton(ctx: ProgrammaticDialogContextType) {
  dialogSingleton = ctx
}
function getDialogSingleton() {
  if (!dialogSingleton)
    throw new Error('ProgrammaticDialogProvider is missing in the React tree')
  return dialogSingleton
}

// Patch the provider to set the singleton
export function ProgrammaticDialogProviderSingleton({
  children,
}: {
  children: React.ReactNode
}) {
  const dialog = useProgrammaticDialog()
  React.useEffect(() => {
    setDialogSingleton({ showDialog: dialog.showDialog })
  }, [dialog.showDialog])
  return (
    <>
      {children}
      {dialog.DialogComponent}
    </>
  )
}
