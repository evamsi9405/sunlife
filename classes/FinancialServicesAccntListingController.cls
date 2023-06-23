public with sharing class FinancialServicesAccntListingController {
    @AuraEnabled
    public static List<Account> getFinancialServicesAccounts(){
        List<Account> accounts = new List<Account>();
        try {
            accounts = [SELECT Id, Name, Owner.Name, Phone, Website, AnnualRevenue FROM Account WHERE Industry ='Financial Services'];           
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return accounts;
    }

    @AuraEnabled
    public static List<Account> getFinancialServicesAccountsByAccountName(String accKey){
        List<Account> accounts = new List<Account>();
        try {
            if(String.isNotBlank(accKey))
            {
                String searchKey = '%'+accKey+'%';
                accounts = [SELECT Id, Name, Owner.Name, Phone, Website, AnnualRevenue FROM Account WHERE Industry ='Financial Services' AND Name Like :searchKey];           
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return accounts;
    }
}