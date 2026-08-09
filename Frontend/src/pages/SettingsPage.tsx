import {
  PageTransition,
  KeyboardShortcutsHint,
  MissionFrame,
  CompactHeader,
} from '@/components/layout/PageTransition'
import { Label, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DarkModeToggle } from '@/components/ui/DarkModeToggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { useUser } from '@/context/UserContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageStateGate } from '@/components/states'
import { usePageState, type AppViewState } from '@/hooks/usePageState'
import { cn } from '@/lib/utils'

const DEMO_STATES: { id: AppViewState; label: string; path: string }[] = [
  { id: 'loading', label: 'Loading', path: '/dashboard?state=loading' },
  { id: 'empty', label: 'Empty', path: '/dashboard?state=empty' },
  { id: 'error', label: 'Error', path: '/dashboard?state=error' },
  { id: 'offline', label: 'Offline', path: '/dashboard?state=offline' },
  { id: 'success', label: 'Success', path: '/dashboard?state=success' },
  { id: 'ready', label: 'Ready', path: '/dashboard' },
]

export function SettingsPage() {
  const { toast } = useToast()
  const { profile, updateProfile } = useUser()
  const { state, retry } = usePageState({ loadMs: 500 })
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [role, setRole] = useState(profile.role)
  const [notifyInterview, setNotifyInterview] = useState(profile.notifyInterview)
  const [notifyAchieve, setNotifyAchieve] = useState(profile.notifyAchieve)

  const save = () => {
    updateProfile({
      name,
      email,
      role,
      notifyInterview,
      notifyAchieve,
    })
    toast({
      title: 'Settings saved',
      description: 'Profile and preferences updated persistently across Helix.',
      variant: 'success',
    })
  }

  return (
    <PageStateGate
      state={state}
      kind="settings"
      onRetry={retry}
      successTitle="Preferences saved"
      successDescription="Your workspace settings are live across Helix."
      successActionLabel="Back to settings"
      successActionTo="/settings"
    >
      <PageTransition>
        <MissionFrame className="max-w-3xl">
          <CompactHeader
            title="Settings"
            description="Profile, appearance, and notifications for your workspace."
          />

          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="states">UI States</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="space-y-4">
                <p className="text-sm text-helix-muted">Visible across chambers and DNA</p>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
                <Button onClick={save}>Save changes</Button>
              </div>
            </TabsContent>

            <TabsContent value="appearance">
              <div className="flex items-center justify-between rounded-xl border border-helix-border/70 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-helix-text">Dark mode</p>
                  <p className="text-xs text-helix-muted">Toggle or press ⌘D</p>
                </div>
                <DarkModeToggle />
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-3">
                <ToggleRow
                  label="Interview reminders"
                  checked={notifyInterview}
                  onChange={setNotifyInterview}
                />
                <ToggleRow
                  label="Achievement unlocks"
                  checked={notifyAchieve}
                  onChange={setNotifyAchieve}
                />
                <Button onClick={save}>Save preferences</Button>
              </div>
            </TabsContent>

            <TabsContent value="shortcuts">
              <KeyboardShortcutsHint />
            </TabsContent>

            <TabsContent value="states">
              <div className="space-y-4">
                <p className="text-sm text-helix-muted">
                  Preview loading, empty, error, offline, and success surfaces.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DEMO_STATES.map((s) => (
                    <Link
                      key={s.id}
                      to={s.path}
                      className={cn(
                        'focus-ring flex items-center justify-between rounded-xl border border-helix-border/70 px-4 py-3 text-sm transition-colors hover:border-helix-signal/35 hover:bg-helix-elevated/40',
                      )}
                    >
                      <span className="font-display font-medium">{s.label}</span>
                      <span className="text-xs text-helix-muted">Preview</span>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/error">
                    <Button variant="secondary" size="sm">
                      Full error page
                    </Button>
                  </Link>
                  <Link to="/this-route-does-not-exist">
                    <Button variant="ghost" size="sm">
                      404 page
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </MissionFrame>
      </PageTransition>
    </PageStateGate>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  const id = label.replace(/\s+/g, '-').toLowerCase()
  return (
    <div className="flex items-center justify-between rounded-xl border border-helix-border px-4 py-3">
      <label htmlFor={id} className="cursor-pointer text-sm text-helix-text">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'focus-ring relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-helix-signal' : 'bg-helix-elevated',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-[var(--color-helix-on-accent)] transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}
