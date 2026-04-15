import AppLogoIcon from './app-logo-icon';
import { CruzRojaLogo } from '../components/CruzRojaLogo';

export default function AppLogo() {
    return (
        <>
            <CruzRojaLogo size="xs" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 hidden truncate text-xs leading-none font-semibold sm:block sm:text-sm">
                    Gestión de Tickets
                </span>
            </div>
        </>
    );
}
