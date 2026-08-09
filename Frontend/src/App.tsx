import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'
import { CandidateDnaProvider } from '@/context/CandidateDnaContext'
import { InterviewProvider } from '@/context/InterviewContext'
import { UserProvider } from '@/context/UserContext'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InterviewPage } from '@/pages/InterviewPage'
import { KnowledgePage } from '@/pages/KnowledgePage'
import { CurriculumPage } from '@/pages/CurriculumPage'
import { DebriefPage } from '@/pages/DebriefPage'
import { DnaPage } from '@/pages/DnaPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ErrorPage } from '@/pages/ErrorPage'

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ToastProvider>
          <CandidateDnaProvider>
            <InterviewProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route element={<AppShell />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/interview" element={<InterviewPage />} />
                    <Route path="/knowledge" element={<KnowledgePage />} />
                    <Route path="/curriculum" element={<CurriculumPage />} />
                    <Route path="/debrief" element={<DebriefPage />} />
                    <Route path="/dna" element={<DnaPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="/error" element={<ErrorPage />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </BrowserRouter>
            </InterviewProvider>
          </CandidateDnaProvider>
        </ToastProvider>
      </UserProvider>
    </ThemeProvider>
  )
}

