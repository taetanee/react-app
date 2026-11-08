import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInvitePublic } from '../../api/weddingPlatform';
import { setPageMeta } from '../../utils/pageMeta';
import InvitationContent from './InvitationContent';
import { babyLabel, CenterMessage } from './inviteParts';

// 돌잔치 초대장 공개 페이지 (/invite/dol/:slug)
export default function DolInvitationView() {
  const { slug } = useParams();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getInvitePublic(slug).then(setInvite).catch(err => setError(err.message));
  }, [slug]);

  useEffect(() => {
    if (!invite) return;
    setPageMeta({
      title: babyLabel(invite) ? `${babyLabel(invite)}의 첫 번째 생일에 초대합니다` : '첫 번째 생일에 초대합니다',
      description: [invite.venueName, invite.venueHall].filter(Boolean).join(' ') || '돌잔치 초대장',
    });
  }, [invite]);

  if (error) return <CenterMessage>초대장을 찾을 수 없습니다.</CenterMessage>;
  if (!invite) return <CenterMessage>불러오는 중...</CenterMessage>;

  // 돌잔치 주소로 들어왔으면 저장된 종류와 상관없이 돌잔치 화면으로 보여준다
  return <InvitationContent invite={{ ...invite, eventType: 'dol' }} slug={slug} />;
}
