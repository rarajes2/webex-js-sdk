import {WebexSDK, HTTP_METHODS} from '../types';
import HttpRequest from './HttpRequest';
import {LogoutSuccess, StationLoginSuccess, UserStationLogin} from './types';
import {
  AgentLogoutFailedEvent,
  AgentLogoutSuccessEvent,
  LOGIN_API,
  LOGOUT_API,
  LOGOUT_EVENT,
  WCC_API_GATEWAY,
} from './constants';

export default class AgentService {
  private webex: WebexSDK;
  private httpRequest: HttpRequest;

  constructor(webex: WebexSDK, httpRequest: HttpRequest) {
    this.webex = webex;
    this.httpRequest = httpRequest;
  }

  public async stationLogin(data: UserStationLogin): Promise<StationLoginSuccess> {
    try {
      const payload = {
        dialNumber: data.dialNumber,
        teamId: data.teamId,
        isExtension: data.isExtension,
        roles: data.roles,
        deviceType: data.deviceType,
        deviceId: data.deviceId,
      };

      const response = await this.httpRequest.sendRequestWithEvent({
        service: WCC_API_GATEWAY,
        resource: LOGIN_API,
        method: HTTP_METHODS.POST,
        payload,
        eventType: 'StationLogin',
        success: ['AgentStationLoginSuccess'],
        failure: ['AgentStationLoginFailed'],
      });

      return response;
    } catch (error) {
      this.webex.logger.error(`Error during station login: ${error}`);

      throw error;
    }
  }

  public async stationLogout(options: {logoutReason: string}): Promise<LogoutSuccess> {
    try {
      const {logoutReason} = options;
      const payload = {
        logoutReason,
      };
      const data = await this.httpRequest.sendRequestWithEvent({
        service: WCC_API_GATEWAY,
        resource: LOGOUT_API,
        method: HTTP_METHODS.PUT,
        payload,
        eventType: LOGOUT_EVENT,
        success: [AgentLogoutSuccessEvent],
        failure: [AgentLogoutFailedEvent],
      });

      return data;
    } catch (error) {
      this.webex.logger.error(`Error during station logout: ${error}`);

      return Promise.reject(error);
    }
  }
}
