// Main app — wires all screens into the design canvas

function App() {
  return (
    <DesignCanvas>
      <DCSection id="ds" title="Système de design" subtitle="Direction A — papier chaleureux">
        <DCArtboard id="ds-1" label="Tokens · Type · Composants" width={1180} height={950}>
          <DSScreen/>
        </DCArtboard>
      </DCSection>

      <DCSection id="member" title="① Member mobile" subtitle="Le cœur de la communauté — mobile-first">
        <DCArtboard id="m-fil" label="Fil de communications" width={320} height={690}>
          <FilScreen/>
        </DCArtboard>
        <DCArtboard id="m-cal" label="Mon Calendrier" width={320} height={690}>
          <CalendrierScreen/>
        </DCArtboard>
        <DCArtboard id="m-club" label="MyClub Volley" width={320} height={690}>
          <MyClubScreen/>
        </DCArtboard>
      </DCSection>

      <DCSection id="secondary" title="② Modules secondaires (mobile)" subtitle="Site public · Mailing · Sponsors · Invitations">
        <DCArtboard id="s-site" label="Site public du club" width={320} height={690}>
          <SitePublicScreen/>
        </DCArtboard>
        <DCArtboard id="s-mail" label="Mailing &amp; campagnes" width={320} height={690}>
          <MailingScreen/>
        </DCArtboard>
        <DCArtboard id="s-spon" label="Sponsors · 5 niveaux" width={320} height={690}>
          <SponsorsScreen/>
        </DCArtboard>
        <DCArtboard id="s-inv" label="Invitations · lien magique" width={320} height={690}>
          <InvitationsScreen/>
        </DCArtboard>
      </DCSection>

      <DCSection id="supporter" title="③ Parcours Supporter" subtitle="Le sympathisant qu'on convertit en membre">
        <DCArtboard id="sup-empty" label="État vide · découvrir" width={320} height={690}>
          <SupporterEmptyScreen/>
        </DCArtboard>
        <DCArtboard id="sup-fil" label="Fil supporter (public + verrous)" width={320} height={690}>
          <SupporterFilScreen/>
        </DCArtboard>
        <DCArtboard id="sup-conv" label="Devenir membre" width={320} height={690}>
          <SupporterConversionScreen/>
        </DCArtboard>
      </DCSection>

      <DCSection id="club-admin" title="④ Vue Club Admin (desktop)" subtitle="L'animateur de terrain — tableau de bord du club">
        <DCArtboard id="ca-dash" label="Tableau de bord du club" width={1040} height={680}>
          <ClubAdminDashboard/>
        </DCArtboard>
        <DCArtboard id="ca-comp" label="Composer une annonce" width={1040} height={680}>
          <ClubAdminCompose/>
        </DCArtboard>
        <DCArtboard id="ca-mem" label="Gestion des membres" width={1040} height={680}>
          <ClubAdminMembers/>
        </DCArtboard>
      </DCSection>

      <DCSection id="super-admin" title="⑤ Vue Super Admin (desktop)" subtitle="La vision d'ensemble — pilote de l'asso">
        <DCArtboard id="sa-over" label="Vue d'ensemble" width={1040} height={680}>
          <SuperAdminOverview/>
        </DCArtboard>
        <DCArtboard id="sa-clubs" label="Tous les clubs" width={1040} height={680}>
          <SuperAdminClubs/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
