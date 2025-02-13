import { t, Trans } from '@lingui/macro';
import getFightName from 'common/getFightName';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import ClassicLogWarning from 'interface/report/ClassicLogWarning';
import FightSelectionPanel from 'interface/report/FightSelectionPanel';
import ReportDurationWarning, { MAX_REPORT_DURATION } from 'interface/report/ReportDurationWarning';
import { getFightFromReport } from 'interface/selectors/fight';
import { getFightId } from 'interface/selectors/url/report';
import Tooltip from 'interface/Tooltip';
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Toggle from 'react-toggle';
import { FightProvider } from 'interface/report/context/FightContext';
import { useReport } from 'interface/report/context/ReportContext';
import { Helmet } from 'react-helmet';
import { isUnsupportedClassicVersion } from 'game/VERSIONS';

interface Props {
  children: ReactNode;
}

const FightSelection = ({ children }: Props) => {
  const location = useLocation();
  const fightId = getFightId(location.pathname);
  const [killsOnly, setKillsOnly] = useState(false);
  const { report, refreshReport } = useReport();
  const reportDuration = report.end - report.start;

  useEffect(() => {
    // Scroll to top of page on initial render
    window.scrollTo(0, 0);
  }, []);

  const fight = fightId && getFightFromReport(report, fightId);
  if (!fightId || !fight) {
    return (
      <div className="container offset fight-selection">
        <div className="flex wrapable" style={{ marginBottom: 15 }}>
          <div className="flex-main" style={{ position: 'relative' }}>
            <div className="back-button">
              <Tooltip
                content={t({
                  id: 'interface.report.fightSelection.tooltip.backToHome',
                  message: `Back to home`,
                })}
              >
                <Link to="/">
                  <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
                  <label>
                    {' '}
                    <Trans id="interface.report.fightSelection.tooltip.home">Home</Trans>
                  </label>
                </Link>
              </Tooltip>
            </div>
            <h1 style={{ lineHeight: 1.4, margin: 0 }}>
              <Trans id="interface.report.fightSelection.fightSelection">Fight selection</Trans>
            </h1>
            <small style={{ marginTop: -5 }}>
              <Trans id="interface.report.fightSelection.fightSelectionDetails">
                Select the fight you wish to analyze. If a boss or encounter is missing, or the list
                below is empty, press the Refresh button above to re-pull the log from Warcraft
                Logs. Additionally, please note that due to the way combat logs work, we are unable
                to evaluate Target Dummy logs.
              </Trans>
            </small>
          </div>
          <div className="flex-sub">
            <div>
              <Tooltip
                content={
                  <Trans id="interface.report.fightSelection.tooltip.refreshFightsList">
                    This will refresh the fights list which can be useful if you're live logging.
                  </Trans>
                }
              >
                <Link to={makeAnalyzerUrl(report)} onClick={refreshReport}>
                  <span className="glyphicon glyphicon-refresh" aria-hidden="true" />{' '}
                  <Trans id="interface.report.fightSelection.refresh">Refresh</Trans>
                </Link>
              </Tooltip>
              <span className="toggle-control" style={{ marginLeft: 5 }}>
                <Toggle
                  checked={killsOnly}
                  icons={false}
                  onChange={(event) => setKillsOnly(event.currentTarget.checked)}
                  id="kills-only-toggle"
                />
                <label htmlFor="kills-only-toggle">
                  {' '}
                  <Trans id="interface.report.fightSelection.killsOnly">Kills only</Trans>
                </label>
              </span>
            </div>
          </div>
        </div>

        {isUnsupportedClassicVersion(report.gameVersion) && <ClassicLogWarning />}

        {reportDuration > MAX_REPORT_DURATION && (
          <ReportDurationWarning duration={reportDuration} />
        )}

        {!isUnsupportedClassicVersion(report.gameVersion) && (
          <FightSelectionPanel report={report} killsOnly={killsOnly} />
        )}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {fight
            ? t({
                id: 'interface.report.fightSelection.documentTitle',
                message: `${getFightName(report, fight)} in ${report.title}`,
              })
            : report.title}
        </title>
      </Helmet>

      <FightProvider fight={fight}>{children}</FightProvider>
    </>
  );
};

export default FightSelection;
