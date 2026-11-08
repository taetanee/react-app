import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInvitePublic } from '../../api/weddingPlatform';
import { setPageMeta } from '../../utils/pageMeta';
import InvitationContent from './InvitationContent';
import { CenterMessage } from './inviteParts';

// 모바일 청첩장 공개 페이지 (/invite/:slug)
export default function InvitationView() {
  const { slug } = useParams();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getInvitePublic(slug).then(setInvite).catch(err => setError(err.message));
  }, [slug]);

  useEffect(() => {
    if (!invite || (invite.eventType && invite.eventType !== 'wedding')) return;
    setPageMeta({
      title: `${invite.groomShort} ♥ ${invite.brideShort} 결혼식에 초대합니다`,
      description: [invite.venueName, invite.venueHall].filter(Boolean).join(' ') || '모바일 청첩장',
    });
  }, [invite]);

  if (error) return <CenterMessage>청첩장을 찾을 수 없습니다.</CenterMessage>;
  if (!invite) return <CenterMessage>불러오는 중...</CenterMessage>;
  // 청첩장이 아닌 예전 데이터(돌잔치 등)는 보여주지 않는다
  if (invite.eventType && invite.eventType !== 'wedding') return <CenterMessage>청첩장을 찾을 수 없습니다.</CenterMessage>;

  return <InvitationContent invite={invite} slug={slug} />;
}
