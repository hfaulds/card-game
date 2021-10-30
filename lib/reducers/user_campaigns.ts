export const CampaignActions = {
  CreateCampaign: "CreateCampaign",
  DeleteCampaign: "DeleteCampaign",
  AddPlayer: "AddPlayer",
  RemovePlayer: "RemovePlaer",
}

export function UserCampaignsReducer(userCampaigns, action) {
  switch (action.type) {
    case CampaignActions.CreateCampaign:
      const userCampaign = action.value.users.find((u) => u.admin)
      return userCampaigns.concat([
        {
          ...userCampaign,
          campaign: action.value,
        },
      ])
    case CampaignActions.DeleteCampaign:
      return userCampaigns.filter((u) => u.campaign.id != action.value)
    case CampaignActions.AddPlayer:
      let { campaign, invite } = action.value
      return userCampaigns.map((u) => {
        if (u.campaign.id != campaign.id) return u
        return {
          ...u,
          campaign: {
            ...campaign,
            users: campaign.users.concat(invite),
          },
        }
      })
    case CampaignActions.RemovePlayer:
      campaign = action.value.campaign
      let { inviteId } = action.value
      return userCampaigns.map((u) => {
        if (u.campaign.id != campaign.id) return u
        return {
          ...u,
          campaign: {
            ...campaign,
            users: campaign.users.filter((u) => u.id != inviteId),
          },
        }
      })
  }
}
