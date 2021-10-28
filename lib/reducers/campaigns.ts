export const CampaignActions = {
  CreateCampaign: 'CreateCampaign',
  DeleteCampaign: 'DeleteCampaign',
  AddPlayer:      'AddPlayer',
  RemovePlayer:   'RemovePlaer',
}

export function CampaignsReducer(campaigns, action){
  switch (action.type) {
    case CampaignActions.CreateCampaign:
      return campaigns.concat([action.value])
    case CampaignActions.DeleteCampaign:
      return campaigns.filter((g) => g.id != action.value)
    case CampaignActions.AddPlayer:
      let { campaign, invite } = action.value
      let newCampaign = {
        id: campaign.id,
        users: campaign.users.concat(invite),
      }
      return campaigns.map((g) => g.id == campaign.id ? newCampaign : g)
    case CampaignActions.RemovePlayer:
      campaign = action.value.campaign
      let { inviteId } = action.value
      newCampaign = {
        id: campaign.id,
        users: campaign.users.filter((u) => u.id != inviteId),
      }
      return campaigns.map((g) => g.id == action.value.campaign.id ? newCampaign : g)
  }
}
