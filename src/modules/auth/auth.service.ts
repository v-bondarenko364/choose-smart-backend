class AuthService {
  public static async loginWithToken() {
    // const users = await UsersModel.findClubAdmins(clubId);
    return { user: null as null, token: null as string | null };
  }
  public static async loginWithVendor() {
    // const users = await UsersModel.findClubAdmins(clubId);
    return { user: null as null, token: null as string | null };
  }
}

export default AuthService;
