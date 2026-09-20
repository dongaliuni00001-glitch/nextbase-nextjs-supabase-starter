'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/supabase-clients/client';
import {
  IntegratedResumeAnalysisResult,
  UserProfile,
  UserProject,
  SavedJobPosting,
} from '@/lib/types/job-matching';

export default function ResumeAnalyzerPage() {
  // =========================================================
  // Supabase 인증 사용자
  // =========================================================
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // =========================================================
  // 입력 필드
  // =========================================================
  const [resumeText, setResumeText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');

  // =========================================================
  // 연동 데이터
  // =========================================================
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [jobs, setJobs] = useState<SavedJobPosting[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  // =========================================================
  // 상태 관리
  // =========================================================
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<IntegratedResumeAnalysisResult | null>(null);

  // =========================================================
  // 1. 현재 로그인 사용자 확인
  // =========================================================
  useEffect(() => {
    let mounted = true;

    const loadAuthUser = async () => {
      try {
        const supabase = createSupabaseClient();

        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (authError || !currentUser) {
          setUser(null);
          setError('로그인이 필요합니다.');
          return;
        }

        setUser({
          id: currentUser.id,
        });
      } catch (err) {
        console.error('❌ 인증 사용자 확인 실패:', err);

        if (mounted) {
          setUser(null);
          setError('로그인 상태를 확인할 수 없습니다.');
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    loadAuthUser();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // 2. 사용자 데이터 로드
  // =========================================================
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;

    setLoadingData(true);
    setError(null);

    try {
      // =======================================================
      // 프로필
      // =======================================================
      const profileRes = await fetch('/api/user/profile');

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      } else if (profileRes.status === 401) {
        setError('로그인이 필요합니다.');
        return;
      }

      // =======================================================
      // 프로젝트
      // =======================================================
      const projectsRes = await fetch('/api/user/projects');

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();

        setProjects(projectsData);

        // 기본적으로 모든 프로젝트 선택
        setSelectedProjects(
          projectsData.map((project: UserProject) => project.id)
        );
      } else if (projectsRes.status === 401) {
        setError('로그인이 필요합니다.');
        return;
      }

      // =======================================================
      // 저장된 취업 공고
      // =======================================================
      const jobsRes = await fetch('/api/user/saved-jobs');

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      } else if (jobsRes.status === 401) {
        setError('로그인이 필요합니다.');
        return;
      }
    } catch (err) {
      console.error('❌ 사용자 데이터 로드 실패:', err);

      setError('사용자 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingData(false);
    }
  };

  // =========================================================
  // 3. AI 분석 실행
  // =========================================================
  const handleAnalyze = async () => {
    // ---------------------------------------------------------
    // 로그인 확인
    // ---------------------------------------------------------
    if (!user?.id) {
      setError('로그인이 필요합니다.');
      return;
    }

    // ---------------------------------------------------------
    // 자기소개서 검증
    // ---------------------------------------------------------
    if (!resumeText.trim()) {
      setError('자기소개서 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('📤 통합 분석 요청:');
      console.log('- 자소서:', `${resumeText.length}자`);
      console.log('- 프로필:', profile?.name || '없음');
      console.log('- 선택 프로젝트:', `${selectedProjects.length}개`);
      console.log('- 선택 공고:', `${selectedJobs.length}개`);

      // =======================================================
      // Task 1:
      // userId를 URL/API 요청에 직접 전달하지 않음
      //
      // 현재 서버 route에서는 인증 세션을 확인합니다.
      // =======================================================
      const payload = {
        resumeText: resumeText.trim(),
        companyName: companyName.trim() || undefined,
        position: position.trim() || undefined,
        targetJobIds:
          selectedJobs.length > 0 ? selectedJobs : undefined,
      };

      const res = await fetch('/api/ai/analyze-resume-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data: any;

      try {
        data = await res.json();
      } catch {
        throw new Error('서버에서 올바른 응답을 받지 못했습니다.');
      }

      if (!res.ok) {
        throw new Error(
          data?.error || '분석 중 오류가 발생했습니다.'
        );
      }

      if (!data?.success || !data?.data) {
        throw new Error('분석 결과를 받을 수 없습니다.');
      }

      console.log('✅ 분석 완료');

      setResult(data.data);
    } catch (err: unknown) {
      console.error('❌ AI 분석 오류:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('서버 통신 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 4. 인증 확인 중
  // =========================================================
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">
            로그인 상태를 확인하는 중...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // 5. 로그인하지 않은 경우
  // =========================================================
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg border text-center">
          <h1 className="text-2xl font-bold mb-3">
            🔐 로그인이 필요합니다.
          </h1>

          <p className="text-gray-500">
            자기소개서 AI 분석을 사용하려면 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // 6. 페이지
  // =========================================================
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          🎯 AI 자소서 심층 분석 (통합판)
        </h1>

        <p className="text-gray-500 text-lg">
          프로필, 프로젝트, 취업 공고와 자소서를 모두 연동하여
          심층 분석합니다.
        </p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===================================================
            왼쪽: 입력 폼
        =================================================== */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border space-y-4">
            <h2 className="text-xl font-bold">📝 기본 정보</h2>

            {/* 회사 / 직무 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  회사명 (선택)
                </label>

                <input
                  type="text"
                  placeholder="예: 삼성전자"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  직무 (선택)
                </label>

                <input
                  type="text"
                  placeholder="예: 백엔드 개발"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800"
                />
              </div>
            </div>

            {/* 프로필 정보 */}
            {profile && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                <p className="text-sm">
                  <span className="font-semibold">👤 프로필:</span>{' '}
                  {profile.name}

                  {profile.experience_years &&
                    ` · ${profile.experience_years}년 경력`}
                </p>
              </div>
            )}

            {/* 자기소개서 */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                자기소개서 *
              </label>

              <textarea
                placeholder="자기소개서를 입력하세요..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full h-72 p-4 border rounded-lg dark:bg-zinc-800 resize-none"
              />

              <p className="mt-1 text-sm text-gray-500">
                {resumeText.length}자 입력됨
              </p>
            </div>

            {/* 에러 */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                <p className="text-red-800 dark:text-red-200">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* 분석 버튼 */}
            <button
              onClick={handleAnalyze}
              disabled={loading || loadingData}
              className="w-full px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition text-lg"
            >
              {loading
                ? '🤖 분석 중... (1-2분 소요)'
                : '🚀 심층 분석 시작'}
            </button>
          </div>
        </div>

        {/* ===================================================
            오른쪽: 연동 데이터
        =================================================== */}
        <div className="space-y-4">
          {/* 프로젝트 선택 */}
          {projects.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border space-y-3">
              <h3 className="font-bold text-lg">
                📁 연동 프로젝트
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {projects.map((project) => (
                  <label
                    key={project.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProjects((prev) => [
                            ...prev,
                            project.id,
                          ]);
                        } else {
                          setSelectedProjects((prev) =>
                            prev.filter(
                              (id) => id !== project.id
                            )
                          );
                        }
                      }}
                      className="w-4 h-4"
                    />

                    <div className="text-sm">
                      <p className="font-semibold">
                        {project.title}
                      </p>

                      <p className="text-gray-500 text-xs">
                        {project.tech_stack}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 취업 공고 */}
          {jobs.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border space-y-3">
              <h3 className="font-bold text-lg">
                💼 연동 취업 공고
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {jobs.map((job) => (
                  <label
                    key={job.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJobs((prev) => [
                            ...prev,
                            job.id,
                          ]);
                        } else {
                          setSelectedJobs((prev) =>
                            prev.filter(
                              (id) => id !== job.id
                            )
                          );
                        }
                      }}
                      className="w-4 h-4"
                    />

                    <div className="text-sm">
                      <p className="font-semibold">
                        {job.company}
                      </p>

                      <p className="text-gray-500 text-xs">
                        {job.position}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 데이터 로딩 */}
          {loadingData && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                데이터 로드 중...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 분석 결과 */}
      {result && <ResultDisplay result={result} />}
    </div>
  );
}

/**
 * ============================================================
 * 결과 표시 컴포넌트
 * ============================================================
 */
function ResultDisplay({
  result,
}: {
  result: IntegratedResumeAnalysisResult;
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 요약 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border">
        <h2 className="text-2xl font-bold mb-3">📋 요약</h2>
        <p className="text-lg">{result.summary}</p>
      </div>

      {/* 프로필 분석 */}
      {result.profileAnalysis && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border space-y-4">
          <h2 className="text-2xl font-bold">
            👤 프로필 완성도
          </h2>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">
                완성도: {result.profileAnalysis.completeness}%
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                style={{
                  width: `${result.profileAnalysis.completeness}%`,
                }}
              />
            </div>
          </div>

          {result.profileAnalysis.recommendations.length > 0 && (
            <div>
              <p className="font-semibold mb-2">
                📌 개선 권장사항:
              </p>

              <ul className="space-y-1 text-sm">
                {result.profileAnalysis.recommendations.map(
                  (rec, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 강점 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          💪 강점 분석
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.strengths.map((item, idx) => (
            <div
              key={idx}
              className="bg-green-50 dark:bg-green-900/20 p-5 rounded-lg border border-green-200"
            >
              <h3 className="font-bold text-lg text-green-900 dark:text-green-200 mb-2">
                {idx + 1}. {item.title}
              </h3>

              <p className="text-sm text-green-800 dark:text-green-300 mb-2">
                {item.description}
              </p>

              <p className="text-xs text-green-700 dark:text-green-400 italic mb-2">
                근거: {item.evidence}
              </p>

              <div className="flex gap-2 flex-wrap text-xs">
                {item.relates_to_profile && (
                  <span className="bg-green-200 dark:bg-green-700 px-2 py-1 rounded">
                    프로필
                  </span>
                )}

                {item.relates_to_projects && (
                  <span className="bg-green-200 dark:bg-green-700 px-2 py-1 rounded">
                    프로젝트
                  </span>
                )}

                {item.relates_to_jobs && (
                  <span className="bg-green-200 dark:bg-green-700 px-2 py-1 rounded">
                    공고 매칭
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 약점 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          ⚠️ 보완 사항
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.weaknesses.map((item, idx) => (
            <div
              key={idx}
              className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-lg border border-yellow-200"
            >
              <h3 className="font-bold text-lg text-yellow-900 dark:text-yellow-200 mb-2">
                {idx + 1}. {item.title}
              </h3>

              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                {item.description}
              </p>

              <p className="text-sm text-yellow-700 dark:text-yellow-400 font-semibold mb-2">
                💡 {item.improvement}
              </p>

              {(item.can_cover_with_projects ||
                item.can_cover_with_skills) && (
                <div className="text-xs text-yellow-700 dark:text-yellow-400">
                  {item.can_cover_with_projects && (
                    <p>✓ {item.can_cover_with_projects}</p>
                  )}

                  {item.can_cover_with_skills && (
                    <p>✓ {item.can_cover_with_skills}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 프로젝트 매칭 */}
      {result.projectMatching &&
        result.projectMatching.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              📁 프로젝트 매칭 분석
            </h2>

            <div className="space-y-4">
              {result.projectMatching.map((proj, idx) => (
                <div
                  key={idx}
                  className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg border border-purple-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-purple-900 dark:text-purple-200">
                      {proj.project_title}
                    </h3>

                    <span className="text-2xl font-bold text-purple-600">
                      {proj.relevance_score}%
                    </span>
                  </div>

                  <p className="text-sm text-purple-700 dark:text-purple-400 mb-3">
                    {proj.how_to_mention}
                  </p>

                  {proj.keywords_to_highlight.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {proj.keywords_to_highlight.map(
                        (kw, kdx) => (
                          <span
                            key={kdx}
                            className="bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-purple-200 px-2 py-1 rounded text-xs font-semibold"
                          >
                            {kw}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {/* 공고별 매칭 */}
      {result.jobMatching &&
        result.jobMatching.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              💼 공고별 매칭 분석
            </h2>

            <div className="space-y-4">
              {result.jobMatching.map((job, idx) => (
                <div
                  key={idx}
                  className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-lg border border-indigo-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-200">
                        {job.company} - {job.position}
                      </h3>
                    </div>

                    <span className="text-2xl font-bold text-indigo-600">
                      {job.match_score}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
                        ✅ 보유 기술:
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {job.matched_skills.map(
                          (skill, sidx) => (
                            <span
                              key={sidx}
                              className="bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-200 px-2 py-1 rounded text-xs"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
                        ❌ 필요 기술:
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {job.missing_skills.map(
                          (skill, sidx) => (
                            <span
                              key={sidx}
                              className="bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-200 px-2 py-1 rounded text-xs"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-indigo-800 dark:text-indigo-300 mb-3">
                    {job.why_good_fit}
                  </p>

                  <div>
                    <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                      💡 자소서 작성 팁:
                    </p>

                    <ul className="text-sm space-y-1">
                      {job.tailoring_tips.map(
                        (tip, tipidx) => (
                          <li
                            key={tipidx}
                            className="text-indigo-700 dark:text-indigo-400"
                          >
                            {tipidx + 1}. {tip}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* 면접 준비 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          🎤 예상 면접 질문
        </h2>

        <div className="space-y-4">
          {result.interviewPreparation.map((qa, idx) => (
            <div
              key={idx}
              className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-lg border border-orange-200"
            >
              <h3 className="font-bold text-lg text-orange-900 dark:text-orange-200 mb-3">
                Q{idx + 1}. {qa.question}
              </h3>

              <div className="space-y-3 ml-4">
                <div>
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">
                    📌 대응 전략:
                  </p>

                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    {qa.strategy}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">
                    💬 샘플 답변:
                  </p>

                  <p className="text-sm text-orange-700 dark:text-orange-400 italic">
                    {qa.sampleAnswer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 종합 평가 */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-lg border">
        <h2 className="text-2xl font-bold mb-4">
          📊 종합 평가
        </h2>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">
                경쟁력 점수: {result.competitiveScore}/100
              </span>

              <span className="text-4xl">
                {result.competitiveScore >= 80
                  ? '🌟'
                  : result.competitiveScore >= 60
                    ? '⭐'
                    : '👍'}
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full"
                style={{
                  width: `${result.competitiveScore}%`,
                }}
              />
            </div>
          </div>

          {result.overallRecommendations.length > 0 && (
            <div>
              <p className="font-semibold mb-3">
                📋 종합 권장사항:
              </p>

              <ul className="space-y-2">
                {result.overallRecommendations.map(
                  (rec, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 text-sm"
                    >
                      <span className="font-bold">
                        {idx + 1}.
                      </span>

                      <span>{rec}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}