
/****** Object:  UserDefinedFunction [dbo].[SplitList]    Script Date: 4/24/2019 6:21:14 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[SplitList] (@list VARCHAR(MAX), @separator VARCHAR(MAX) = ';')
RETURNS @table TABLE (Value VARCHAR(MAX))
AS BEGIN
  DECLARE @position INT, @previous INT
  SET @list = @list + @separator
  SET @previous = 1
  SET @position = CHARINDEX(@separator, @list)
  WHILE @position > 0 
  BEGIN
    IF @position - @previous > 0
      INSERT INTO @table VALUES (SUBSTRING(@list, @previous, @position - @previous))
    IF @position >= LEN(@list) BREAK
      SET @previous = @position + 1
      SET @position = CHARINDEX(@separator, @list, @previous)
  END
  RETURN
END
GO
/****** Object:  UserDefinedFunction [dbo].[fn_tb_get_wght_diff]    Script Date: 4/24/2019 6:21:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Prabhu
-- Create date: 2019-03-13
-- Description:	GET CATTLE WEIGHT DIFFERENCE BY MONTH
-- =============================================
/*
	select * from fn_tb_get_wght_diff(1,'2012-07-01')
*/
CREATE FUNCTION [dbo].[fn_tb_get_wght_diff]
(
	@p_client_id bigint,
	 @p_as_of_dt date
)
RETURNS TABLE 
AS
RETURN 
(
	-- Add the SELECT statement with parameter references here
	select tmp3.*
    ,REPLACE(CONVERT(CHAR(9),tmp3.PRV_DT, 6),' ', '-') PDT
    ,REPLACE(CONVERT(CHAR(9),tmp3.ACT_DT, 6),' ', '-') ADT
    from 
    (
        SELECT ROW_NUMBER() OVER(ORDER BY ACT_ID ) AS SNO
        ,tmp2.ACT_ID,tmp2.GT_ID, M.GT_NO 
        ,(select top 1 ss.GT_STATUS_NAME from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.STATUS_ID) STATUS_NAME
        ,(select top 1 ss.GT_STATUS_NAME from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.BREED_ID) BREED_NAME
		,(select top 1 ss.GT_STATUS_CODE from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.BREED_ID) BREED_CODE
		,(select top 1 ss.BREED_COST_PER_KG from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.BREED_ID) BREED_COST
        ,m.PARENT_GT_ID,m.SHED,m.SOLD_DT
        ,CASE WHEN M.BIRTH_DT IS NULL THEN NULL ELSE CONCAT(Round(DATEDIFF(MONTH, M.BIRTH_DT, GETDATE()) / 12,0),'.',(DATEDIFF(MONTH, M.BIRTH_DT, GETDATE())%12)) END AGE
        ,PRV_DT
        ,tmp2.PRV_WGHT
        ,ACT_DT
        , tmp2.ACT_WGHT 
        ,(select top 1 ss.GT_STATUS_CODE from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.STATUS_ID) STATUS_CODE
        from  
        (
            select tb2.*
            ,(select top 1 act_id from TB_GT_ACT acc where acc.ACT_DT = tb2.ACT_DT AND acc.GT_ID= tb2.GT_ID) as ACT_ID 
            ,(select top 1 WGHT from TB_GT_ACT acc where acc.ACT_DT = tb2.ACT_DT AND acc.GT_ID= tb2.GT_ID) as ACT_WGHT 
            ,(select top 1 WGHT from TB_GT_ACT acc where acc.ACT_DT = tb2.PRV_DT AND acc.GT_ID= tb2.GT_ID) as PRV_WGHT 
            from
            ( 
                select 				
                    cs.GT_ID
                ,(SELECT MAX(ACT_DT) FROM TB_GT_ACT ACC WHERE ACC.ACT_DT<CS.ACT_DT) PRV_DT
                ,CS.ACT_DT FROM
                (
                    select 
					(SELECT MAX(ACT_DT) from TB_GT_ACT AC where 
					year(ac.act_dt)=year(@p_as_of_dt) AND MONTH(ac.act_dt)=MONTH(@p_as_of_dt)) ACT_DT
					,GT_ID from TB_GT_ACT AC where 
					year(ac.act_dt)=year(@p_as_of_dt)  AND MONTH(ac.act_dt)=MONTH(@p_as_of_dt)
                    AND ac.CLIENT_ID=@p_client_id 
                    union 
                    select 
					(SELECT MAX(ACT_DT) from TB_GT_ACT AC where 
					year(ac.act_dt)=year(@p_as_of_dt) AND MONTH(ac.act_dt)=MONTH(@p_as_of_dt)) ACT_DT
					,GT_ID FROM  TB_GT_ACT AC where ac.act_dt=
					(
						SELECT MAX(ACT_DT) FROM TB_GT_ACT ACC WHERE ACC.ACT_DT<@p_as_of_dt
						AND ac.CLIENT_ID=@p_client_id
                    )
                ) CS
            ) tb2
        ) tmp2 left join TB_GT_MASTER M
        ON TMP2.GT_ID = M.GT_ID
    ) tmp3  where 
    (tmp3.STATUS_CODE='sold' and tmp3.SOLD_DT> DATEADD(s,-1,DATEADD(mm, DATEDIFF(m,0,tmp3.ACT_DT)+1,0)))
    or
    (tmp3.STATUS_CODE <>'sold')
)
GO
/****** Object:  View [dbo].[vw_client_txn_dt]    Script Date: 4/24/2019 6:21:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create view [dbo].[vw_client_txn_dt] as 
select distinct  DATEADD(MONTH, DATEDIFF(MONTH, 0,PURCHASE_DT), 0)  DT,CLIENT_ID from TB_GT_MASTER 
WHERE PURCHASE_DT IS NOT NULL  
union 
select distinct DATEADD(MONTH, DATEDIFF(MONTH, 0,SOLD_DATE), 0),CLIENT_ID  from TB_GT_MASTER 
WHERE SOLD_DATE IS NOT NULL 
union 
select distinct DATEADD(MONTH, DATEDIFF(MONTH, 0,OPR_DT), 0),CLIENT_ID  from TB_GT_OPR_COST 
WHERE OPR_DT IS NOT NULL 
union 
select distinct DATEADD(MONTH, DATEDIFF(MONTH, 0,[ACT_DT]), 0),CLIENT_ID from [TB_GT_ACT] 
WHERE [ACT_DT] IS NOT NULL 

GO
/****** Object:  View [dbo].[vw_rpt_fod_guide]    Script Date: 4/24/2019 6:21:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE view [dbo].[vw_rpt_fod_guide] as 
SELECT TB2.*,
(SELECT MAX(PELLET_GRAM) FROM TB_GT_FOD_GUIDE FD WHERE FD.FROM_WGHT_KG <= TB2.WGHT AND FD.TO_WGHT_KG >= TB2.WGHT) AS PELLET,
(SELECT MAX(GREEN_GRAM) FROM TB_GT_FOD_GUIDE FD WHERE FD.FROM_WGHT_KG <= TB2.WGHT AND FD.TO_WGHT_KG >= TB2.WGHT) AS GREEN,
(SELECT MAX(OREL_GRAM) FROM TB_GT_FOD_GUIDE FD WHERE FD.FROM_WGHT_KG <= TB2.WGHT AND FD.TO_WGHT_KG >= TB2.WGHT) AS OREL

FROM
(
	SELECT TB1.CLIENT_ID,TB1.GT_ID,TB1.GT_NO,TB1.SHED,TB1.GENDER, TB1.AGE
	,CASE WHEN TB1.WGHT IS NULL THEN TB1.PURCHASE_WEIGHT ELSE TB1.WGHT END WGHT 
	,TB1.TOT_MNTH	
	,CASE WHEN TB1.TOT_MNTH >0 THEN  ROUND((TB1.TOT_GAIN / TB1.TOT_MNTH),2) ELSE 0 END  AS AVG_WGHT_GAIN
	FROM 
	(
		select ms.CLIENT_ID,ms.GT_ID, ms.GT_NO,ms.GENDER,ms.SHED,
		ms.PURCHASE_WEIGHT 
		,(SELECT MAX(WGHT) FROM TB_GT_ACT AC WHERE AC.GT_ID= MS.GT_ID AND WGHT IS NOT NULL AND 
		ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT AX WHERE AX.GT_ID=AC.GT_ID)) AS WGHT
		,CASE WHEN MS.BIRTH_DT IS NULL THEN NULL ELSE CONCAT(Round(DATEDIFF(MONTH, MS.BIRTH_DT, GETDATE()) / 12,0),'.',(DATEDIFF(MONTH, MS.BIRTH_DT, GETDATE())%12)) END AGE
		,(select sum(WGHT_DIFF) FROM dbo.vw_rpt_wght_diff df where df.GT_ID = ms.GT_ID) as TOT_GAIN
		,(select count(*) FROM dbo.vw_rpt_wght_diff df where df.GT_ID = ms.GT_ID) as TOT_MNTH
		From TB_GT_MASTER ms where ms.STATUS='ALIVE'
	) TB1
) TB2
GO
/****** Object:  View [dbo].[vw_rpt_pft_mnth_sumry]    Script Date: 4/24/2019 6:21:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



/*
select * From vw_rpt_pft_mnth_sumry
*/

CREATE view [dbo].[vw_rpt_pft_mnth_sumry] as 

SELECT TB5.*
FROM 
(
	SELECT TB4.*
	,ROUND(CASE WHEN TB4.CATTLE_CNT > 0  THEN TB4.WGHT_GAIN / TB4.CATTLE_CNT ELSE 0 END,1) AVG_WGHT_GAIN
	,ROUND(CASE WHEN TB4.CATTLE_CNT > 0  THEN TB4.FEED_COST / TB4.CATTLE_CNT ELSE 0 END,1) AVG_FEED_COST
	,((Isnull(TB4.SELL_PROFIT,0) + isnull(TB4.WGHT_GAIN_PROFIT,0) + isnull(TB4.OTHER_INCOME,0)) - isnull(TB4.OTHER_EXPENSE,0)) AS TOT_PROFIT_ASS_GAIN
	FROM 
	(
		SELECT TB3.*
		,(TB3.CUR_MNTH_WGHT - TB3.PRV_MNTH_WGHT) AS WGHT_GAIN
		,(TB3.CUR_MNTH_WGHT_COST - TB3.PRV_MNTH_WGHT_COST) AS WGHT_GAIN_PROFIT
		,(select SUM([DEBIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND ST.REF_CODE='REF_CODE_FOD' 
			AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
		) FEED_COST
		,(select SUM([DEBIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND isnull(ST.REF_CODE,'-') <> 'REF_CODE_FOD' AND ST.GT_STATUS_CODE='CODE_EXPENSE'
			AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
		) OTHER_EXPENSE
		,(select SUM([DEBIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND ST.GT_STATUS_CODE='CODE_INVEST'
			AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
		) ASSET_INVEST
		,(select SUM([CREDIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND ST.GT_STATUS_CODE='CODE_INCOME'
			AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
		) OTHER_INCOME
		FROM
		(
			SELECT tb2.*
			,(tb2.SELL_COST - tb2.PURCHASE_COST) as SELL_PROFIT
			, CASE WHEN tb2.SELL_COST > 0 THEN round(((tb2.SELL_COST- tb2.PURCHASE_COST)/tb2.SELL_COST)*100,2)  ELSE 0 END as SELL_PROFIT_PERC
			, (select count(*) from TB_GT_ACT ac where 
				ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(tb2.MNTH) AND month(acs.ACT_DT)=month(tb2.MNTH))
				and year(ac.ACT_DT)= year(tb2.MNTH) AND month(ac.ACT_DT)=month(tb2.MNTH)
				) as CATTLE_CNT
			,(select sum(ac.[WGHT]) from TB_GT_ACT ac where 
				year(ac.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(ac.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH))
				and ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(acs.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH)))	
				) PRV_MNTH_WGHT
			,(select sum(ac.[WGHT]) from TB_GT_ACT ac where 			    
				ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(tb2.MNTH) AND month(acs.ACT_DT)=month(tb2.MNTH))	
				and year(ac.ACT_DT)= year(tb2.MNTH) AND month(ac.ACT_DT)=month(tb2.MNTH)
				) CUR_MNTH_WGHT	
			,(select sum(ac.[WGHT] * s.[BREED_COST_PER_KG] ) from TB_GT_ACT ac,TB_GT_MASTER m, TB_GT_STATUS s where 
			    ac.GT_ID = m.GT_ID and m.BREED = s.GT_STATUS_CODE 
				and year(ac.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(ac.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH))
				and ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(acs.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH)))	
				) PRV_MNTH_WGHT_COST
			,(select sum(ac.[WGHT]  * s.[BREED_COST_PER_KG]) from TB_GT_ACT ac,TB_GT_MASTER m, TB_GT_STATUS s where 		
				ac.GT_ID = m.GT_ID and m.BREED = s.GT_STATUS_CODE 	    
				and ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(tb2.MNTH) AND month(acs.ACT_DT)=month(tb2.MNTH))	
				and year(ac.ACT_DT)= year(tb2.MNTH) AND month(ac.ACT_DT)=month(tb2.MNTH)
				) CUR_MNTH_WGHT_COST
			 
			from 
			(
				select  CONVERT(date, tb1.dt) MNTH
				,(select count(*) from TB_GT_MASTER ms where ms.sold_dt is not null 
					and year(ms.sold_dt) = year(tb1.dt) and month(ms.sold_dt)= month(tb1.dt)  
					and ms.CLIENT_ID= tb1.CLIENT_ID AND ms.STATUS in ('SOLD','DEAD')
					) as SALE_CNT
				,isnull((select SUM(ms.PURCHASE_AMOUNT) from TB_GT_MASTER ms where ms.sold_dt is not null 
					and year(ms.sold_dt) = year(tb1.dt) and month(ms.sold_dt)= month(tb1.dt) 
					and ms.CLIENT_ID= tb1.CLIENT_ID  AND ms.STATUS in ('SOLD','DEAD')
					),0) as PURCHASE_COST
				,isnull((select SUM(ms.SOLD_PRICE) from TB_GT_MASTER ms where ms.sold_dt is not null 
					and year(ms.sold_dt) = year(tb1.dt) and month(ms.sold_dt)= month(tb1.dt) 
					and ms.CLIENT_ID= tb1.CLIENT_ID  AND ms.STATUS in ('SOLD','DEAD')
					),0) as SELL_COST
				,tb1.CLIENT_ID
				from 
				(
					select DT,client_id From vw_client_txn_dt
				) tb1
			) TB2

		) TB3
	) TB4 
) TB5
/*


select sum(wght) From TB_GT_ACT  where ACT_DT='2018-01-01'
select sum(wght) From TB_GT_ACT where ACT_DT='2018-12-31'
select sum(wght) From TB_GT_ACT where ACT_DT='2018-01-01'

SELECT sum(wght)  From TB_GT_ACT  where YEAR(ACT_DT) =YEAR('2018-01-31') AND MONTH(ACT_DT) = MONTH('2018-01-31')
SELECT sum(wght)  From TB_GT_ACT  where  YEAR(ACT_DT) =YEAR('2017-12-01') AND MONTH(ACT_DT) = MONTH('2017-12-01')
SELECT DISTINCT ACT_DT  From TB_GT_ACT  where  YEAR(ACT_DT) =YEAR('2017-12-31') AND MONTH(ACT_DT) = MONTH('2017-12-31')

select * From tb_gt_master where breed is null 


*/
GO
/****** Object:  View [dbo].[vw_rpt_wght_diff]    Script Date: 4/24/2019 6:21:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[vw_rpt_wght_diff] as 
SELECT * FROM 
(
	SELECT TB2.* 
	,(TB2.WGHT-TB2.PRV_WGHT) WGHT_DIFF
	FROM 
	(
		select tb1.*,
		(select max(wght) from TB_GT_ACT prvw where prvw.ACT_DT = tb1.PRV_MNTH AND prvw.GT_ID = tb1.GT_ID) AS PRV_WGHT
		from
		(
			select ACT_DT,GT_ID,WGHT,CLIENT_ID
			,(SELECT MAX(PRV.ACT_DT) FROM TB_GT_ACT PRV WHERE  PRV.ACT_DT <ac.ACT_DT) PRV_MNTH
			From TB_GT_ACT ac --where ac.gt_id = 10 
		) tb1
	) TB2 
)
TB3 where TB3.WGHT_DIFF IS NOT NULL 
GO
/****** Object:  View [dbo].[x_vw_rpt_fod_guide]    Script Date: 4/24/2019 6:21:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE view [dbo].[x_vw_rpt_fod_guide] as 
SELECT TB2.*,
(SELECT MAX(PELLET_GRAM) FROM TB_GT_FOD_GUIDE FD WHERE FD.FROM_WGHT_KG <= TB2.WGHT AND FD.TO_WGHT_KG >= TB2.WGHT) AS PELLET,
(SELECT MAX(GREEN_GRAM) FROM TB_GT_FOD_GUIDE FD WHERE FD.FROM_WGHT_KG <= TB2.WGHT AND FD.TO_WGHT_KG >= TB2.WGHT) AS GREEN,
(SELECT MAX(OREL_GRAM) FROM TB_GT_FOD_GUIDE FD WHERE FD.FROM_WGHT_KG <= TB2.WGHT AND FD.TO_WGHT_KG >= TB2.WGHT) AS OREL

FROM
(
	SELECT TB1.CLIENT_ID,TB1.GT_ID,TB1.GT_NO,TB1.SHED,TB1.GENDER, TB1.AGE
	,CASE WHEN TB1.WGHT IS NULL THEN TB1.PURCHASE_WEIGHT ELSE TB1.WGHT END WGHT 
	,TB1.TOT_MNTH	
	,CASE WHEN TB1.TOT_MNTH >0 THEN  ROUND((TB1.TOT_GAIN / TB1.TOT_MNTH),2) ELSE 0 END  AS AVG_WGHT_GAIN
	FROM 
	(
		select ms.CLIENT_ID,ms.GT_ID, ms.GT_NO,ms.GENDER,ms.SHED,
		ms.PURCHASE_WEIGHT 
		,(SELECT MAX(WGHT) FROM TB_GT_ACT AC WHERE AC.GT_ID= MS.GT_ID AND WGHT IS NOT NULL AND 
		ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT AX WHERE AX.GT_ID=AC.GT_ID)) AS WGHT
		,CASE WHEN MS.BIRTH_DT IS NULL THEN NULL ELSE CONCAT(Round(DATEDIFF(MONTH, MS.BIRTH_DT, GETDATE()) / 12,0),'.',(DATEDIFF(MONTH, MS.BIRTH_DT, GETDATE())%12)) END AGE
		,(select sum(WGHT_DIFF) FROM dbo.vw_rpt_wght_diff df where df.GT_ID = ms.GT_ID) as TOT_GAIN
		,(select count(*) FROM dbo.vw_rpt_wght_diff df where df.GT_ID = ms.GT_ID) as TOT_MNTH
		From TB_GT_MASTER ms where ms.STATUS='ALIVE'
	) TB1
) TB2
GO
/****** Object:  View [dbo].[x_vw_rpt_pft_mnth_sumry]    Script Date: 4/24/2019 6:21:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



/*
select * From vw_rpt_pft_mnth_sumry
*/

CREATE view [dbo].[x_vw_rpt_pft_mnth_sumry] as 

SELECT TB5.*
FROM 
(
	SELECT TB4.*
	,ROUND(CASE WHEN TB4.CATTLE_CNT > 0  THEN TB4.WGHT_GAIN / TB4.CATTLE_CNT ELSE 0 END,1) AVG_WGHT_GAIN
	,ROUND(CASE WHEN TB4.CATTLE_CNT > 0  THEN TB4.FEED_COST / TB4.CATTLE_CNT ELSE 0 END,1) AVG_FEED_COST
	,((Isnull(TB4.SELL_PROFIT,0) + isnull(TB4.WGHT_GAIN_PROFIT,0) + isnull(TB4.OTHER_INCOME,0)) - isnull(TB4.OTHER_EXPENSE,0)) AS TOT_PROFIT_ASS_GAIN
	FROM 
	(
		SELECT TB3.*
		,(TB3.CUR_MNTH_WGHT - TB3.PRV_MNTH_WGHT) AS WGHT_GAIN
		,(TB3.CUR_MNTH_WGHT_COST - TB3.PRV_MNTH_WGHT_COST) AS WGHT_GAIN_PROFIT
		,(select SUM([DEBIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND ST.REF_CODE='REF_CODE_FOD' 
			AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
		) FEED_COST
		,(select SUM([DEBIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND isnull(ST.REF_CODE,'-') <> 'REF_CODE_FOD' AND ST.GT_STATUS_CODE='CODE_EXPENSE'
			AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
		) OTHER_EXPENSE
		,(select SUM([DEBIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND ST.GT_STATUS_CODE='CODE_INVEST'
			AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
		) ASSET_INVEST
		,(select SUM([CREDIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND ST.GT_STATUS_CODE='CODE_INCOME'
			AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
		) OTHER_INCOME
		FROM
		(
			SELECT tb2.*
			,(tb2.SELL_COST - tb2.PURCHASE_COST) as SELL_PROFIT
			, CASE WHEN tb2.SELL_COST > 0 THEN round(((tb2.SELL_COST- tb2.PURCHASE_COST)/tb2.SELL_COST)*100,2)  ELSE 0 END as SELL_PROFIT_PERC
			, (select count(*) from TB_GT_ACT ac where 
				ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(tb2.MNTH) AND month(acs.ACT_DT)=month(tb2.MNTH))
				and year(ac.ACT_DT)= year(tb2.MNTH) AND month(ac.ACT_DT)=month(tb2.MNTH)
				) as CATTLE_CNT
			,(select sum(ac.[WGHT]) from TB_GT_ACT ac where 
				year(ac.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(ac.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH))
				and ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(acs.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH)))	
				) PRV_MNTH_WGHT
			,(select sum(ac.[WGHT]) from TB_GT_ACT ac where 			    
				ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(tb2.MNTH) AND month(acs.ACT_DT)=month(tb2.MNTH))	
				and year(ac.ACT_DT)= year(tb2.MNTH) AND month(ac.ACT_DT)=month(tb2.MNTH)
				) CUR_MNTH_WGHT	
			,(select sum(ac.[WGHT] * s.[BREED_COST_PER_KG] ) from TB_GT_ACT ac,TB_GT_MASTER m, TB_GT_STATUS s where 
			    ac.GT_ID = m.GT_ID and m.BREED = s.GT_STATUS_CODE 
				and year(ac.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(ac.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH))
				and ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(acs.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH)))	
				) PRV_MNTH_WGHT_COST
			,(select sum(ac.[WGHT]  * s.[BREED_COST_PER_KG]) from TB_GT_ACT ac,TB_GT_MASTER m, TB_GT_STATUS s where 		
				ac.GT_ID = m.GT_ID and m.BREED = s.GT_STATUS_CODE 	    
				and ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(tb2.MNTH) AND month(acs.ACT_DT)=month(tb2.MNTH))	
				and year(ac.ACT_DT)= year(tb2.MNTH) AND month(ac.ACT_DT)=month(tb2.MNTH)
				) CUR_MNTH_WGHT_COST
			 
			from 
			(
				select  CONVERT(date, tb1.dt) MNTH
				,(select count(*) from TB_GT_MASTER ms where ms.sold_dt is not null 
					and year(ms.sold_dt) = year(tb1.dt) and month(ms.sold_dt)= month(tb1.dt)  
					and ms.CLIENT_ID= tb1.CLIENT_ID AND ms.STATUS in ('SOLD','DEAD')
					) as SALE_CNT
				,isnull((select SUM(ms.PURCHASE_AMOUNT) from TB_GT_MASTER ms where ms.sold_dt is not null 
					and year(ms.sold_dt) = year(tb1.dt) and month(ms.sold_dt)= month(tb1.dt) 
					and ms.CLIENT_ID= tb1.CLIENT_ID  AND ms.STATUS in ('SOLD','DEAD')
					),0) as PURCHASE_COST
				,isnull((select SUM(ms.SOLD_PRICE) from TB_GT_MASTER ms where ms.sold_dt is not null 
					and year(ms.sold_dt) = year(tb1.dt) and month(ms.sold_dt)= month(tb1.dt) 
					and ms.CLIENT_ID= tb1.CLIENT_ID  AND ms.STATUS in ('SOLD','DEAD')
					),0) as SELL_COST
				,tb1.CLIENT_ID
				from 
				(
					select DT,client_id From vw_client_txn_dt
				) tb1
			) TB2

		) TB3
	) TB4 
) TB5
/*


select sum(wght) From TB_GT_ACT  where ACT_DT='2018-01-01'
select sum(wght) From TB_GT_ACT where ACT_DT='2018-12-31'
select sum(wght) From TB_GT_ACT where ACT_DT='2018-01-01'

SELECT sum(wght)  From TB_GT_ACT  where YEAR(ACT_DT) =YEAR('2018-01-31') AND MONTH(ACT_DT) = MONTH('2018-01-31')
SELECT sum(wght)  From TB_GT_ACT  where  YEAR(ACT_DT) =YEAR('2017-12-01') AND MONTH(ACT_DT) = MONTH('2017-12-01')
SELECT DISTINCT ACT_DT  From TB_GT_ACT  where  YEAR(ACT_DT) =YEAR('2017-12-31') AND MONTH(ACT_DT) = MONTH('2017-12-31')

select * From tb_gt_master where breed is null 


*/
GO
/****** Object:  Table [dbo].[DUAL]    Script Date: 4/24/2019 6:21:15 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DUAL](
	[DUMMY] [varchar](1) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_GT_ACT]    Script Date: 4/24/2019 6:21:16 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_GT_ACT](
	[ACT_ID] [bigint] IDENTITY(1,1) NOT NULL,
	[ACT_DT] [date] NULL,
	[GT_ID] [bigint] NULL,
	[WGHT] [decimal](18, 2) NULL,
	[MNTH_MEDICINE] [bit] NULL,
	[YRLY_MEDICINE] [bit] NULL,
	[CRE_DT] [datetime] NOT NULL,
	[CRE_USR_ID] [bigint] NULL,
	[UPD_DT] [datetime] NULL,
	[UPD_USR_ID] [bigint] NULL,
	[CLIENT_ID] [bigint] NOT NULL,
 CONSTRAINT [PK_TB_GT_ACT] PRIMARY KEY CLUSTERED 
(
	[ACT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_GT_FOD_GUIDE]    Script Date: 4/24/2019 6:21:17 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_GT_FOD_GUIDE](
	[FOD_GUIDE_ID] [bigint] IDENTITY(1,1) NOT NULL,
	[FROM_WGHT_KG] [float] NULL,
	[TO_WGHT_KG] [float] NULL,
	[PELLET_GRAM] [float] NULL,
	[GREEN_GRAM] [float] NULL,
	[OREL_GRAM] [float] NULL,
	[CLIENT_ID] [bigint] NOT NULL,
	[CRE_DT] [datetime] NOT NULL,
	[CRE_USR_ID] [bigint] NOT NULL,
	[UPD_DT] [datetime] NOT NULL,
	[UPD_USR_ID] [bigint] NOT NULL,
 CONSTRAINT [PK_TB_GT_FOD_GUIDE] PRIMARY KEY CLUSTERED 
(
	[FOD_GUIDE_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_GT_MASTER]    Script Date: 4/24/2019 6:21:17 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_GT_MASTER](
	[GT_ID] [bigint] IDENTITY(1,1) NOT NULL,
	[GT_NO] [nvarchar](16) NOT NULL,
	[GT_NAME] [nvarchar](64) NULL,
	[PURCHASE_DT] [date] NULL,
	[PURCHASE_WEIGHT] [decimal](18, 2) NULL,
	[PURCHASE_AMOUNT] [money] NOT NULL,
	[BIRTH_DT] [date] NULL,
	[SOLD_DT] [date] NULL,
	[SOLD_PRICE] [money] NULL,
	[STATUS] [nvarchar](32) NOT NULL,
	[BREED] [nvarchar](32) NULL,
	[BUY_LOCATION] [nvarchar](64) NULL,
	[PARENT_GT_ID] [bigint] NULL,
	[SOLD_DATE] [datetime] NULL,
	[GENDER] [nvarchar](1) NULL,
	[REMARKS] [nvarchar](255) NULL,
	[FOR_RESALE] [bit] NOT NULL,
	[FATHER_GT_ID] [int] NULL,
	[SHED] [nvarchar](16) NULL,
	[CLIENT_ID] [bigint] NULL,
	[CRE_DT] [datetime] NULL,
	[CRE_USR_ID] [bigint] NULL,
	[UPD_DT] [datetime] NULL,
	[UPD_USR_ID] [bigint] NULL,
	[STATUS_ID] [int] NULL,
	[BREED_ID] [int] NULL,
	[GENDER_ID] [int] NULL,
	[FOR_SALE_ID] [int] NULL,
 CONSTRAINT [PK_TB_GT_MASTER_1] PRIMARY KEY CLUSTERED 
(
	[GT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_GT_OPR_COST]    Script Date: 4/24/2019 6:21:18 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_GT_OPR_COST](
	[OPR_ID] [bigint] IDENTITY(1,1) NOT NULL,
	[OPR_DT] [date] NULL,
	[OPR_TYPE_CODE] [varchar](50) NULL,
	[CREDIT] [decimal](18, 0) NULL,
	[DEBIT] [decimal](18, 0) NULL,
	[REMARKS] [varchar](255) NULL,
	[CLIENT_ID] [bigint] NULL,
	[CRE_DT] [datetime] NULL,
	[CRE_USR_ID] [bigint] NULL,
	[UPD_DT] [datetime] NULL,
	[UPD_USR_ID] [bigint] NULL,
	[GT_STATUS_ID] [int] NULL,
 CONSTRAINT [PK_TB_GT_OPR_COST] PRIMARY KEY CLUSTERED 
(
	[OPR_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_GT_PHOTO]    Script Date: 4/24/2019 6:21:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_GT_PHOTO](
	[GT_PHOTO_ID] [int] IDENTITY(1,1) NOT NULL,
	[GT_ID] [bigint] NULL,
	[FILE_ATTRIBUTE] [varchar](150) NULL,
	[FILE_SIZE] [int] NULL,
	[FILE_STREAM] [varchar](max) NULL,
	[CRE_DT] [datetime] NULL,
	[CRE_USR_ID] [bigint] NULL,
	[UPD_DT] [datetime] NULL,
	[UPD_USR_ID] [bigint] NULL,
	[IMG_PATH] [varchar](64) NULL,
	[ICON_PATH] [varchar](64) NULL,
	[FILE_NAME] [varchar](64) NULL,
	[ICON_STREAM] [varchar](max) NULL,
	[CLIENT_ID] [bigint] NULL,
 CONSTRAINT [PK_TB_GT_PHOTO_1] PRIMARY KEY CLUSTERED 
(
	[GT_PHOTO_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_GT_STATUS]    Script Date: 4/24/2019 6:21:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_GT_STATUS](
	[GT_STATUS_ID] [int] IDENTITY(1,1) NOT NULL,
	[GT_PARENT_STATUS] [varchar](100) NULL,
	[GT_STATUS_CODE] [varchar](100) NULL,
	[GT_STATUS_REMARKS] [varchar](100) NULL,
	[CRE_DT] [datetime] NULL,
	[CRE_USR_ID] [bigint] NULL,
	[UPD_DT] [datetime] NULL,
	[UPD_USR_ID] [bigint] NULL,
	[CLIENT_ID] [bigint] NULL,
	[SHOW_IN_RPT] [bit] NULL,
	[REF_CODE] [varchar](50) NULL,
	[BREED_COST_PER_KG] [money] NULL,
	[GT_STATUS_NAME] [nvarchar](64) NULL,
 CONSTRAINT [PK_TB_GT_STATUS] PRIMARY KEY CLUSTERED 
(
	[GT_STATUS_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_M_CLIENT]    Script Date: 4/24/2019 6:21:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_M_CLIENT](
	[CLIENT_ID] [bigint] IDENTITY(1,1) NOT NULL,
	[CLIENT_PUBLIC_NAME] [varchar](50) NULL,
	[CRE_DT] [datetime] NULL,
	[CRE_USR_ID] [bigint] NULL,
	[UPD_DT] [datetime] NULL,
	[UPD_USR_ID] [bigint] NULL,
	[CLIENT_PUBLIC_EMAIL] [varchar](64) NULL,
	[CLIENT_PUBLIC_NO] [varchar](64) NULL,
	[CLIENT_PUBLIC_ADDRESS] [varchar](128) NULL,
	[CLIENT_COORDINATES] [varchar](64) NULL,
	[RATE_PER_CATTLE] [money] NULL,
 CONSTRAINT [PK_TB_M_CLIENT_1] PRIMARY KEY CLUSTERED 
(
	[CLIENT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_M_RPT]    Script Date: 4/24/2019 6:21:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_M_RPT](
	[RPT_ID] [int] IDENTITY(1,1) NOT NULL,
	[RPT_CODE] [varchar](50) NULL,
	[RPT_NAME] [nvarchar](64) NULL,
	[RPT_TYPE] [varchar](50) NULL,
	[CRE_DT] [datetime] NOT NULL,
	[CRE_USR_ID] [bigint] NULL,
	[UPD_DT] [datetime] NULL,
	[UPD_USR_ID] [bigint] NULL,
	[CLIENT_ID] [bigint] NOT NULL,
 CONSTRAINT [PK_TB_RPT] PRIMARY KEY CLUSTERED 
(
	[RPT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_M_USER]    Script Date: 4/24/2019 6:21:21 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_M_USER](
	[USER_ID] [bigint] IDENTITY(1,1) NOT NULL,
	[USER_EMAIL] [varchar](50) NULL,
	[PASSWORD] [varchar](max) NULL,
	[MOBILE_NO] [varchar](50) NULL,
	[CRE_DT] [datetime] NULL,
	[CLIENT_ID] [bigint] NULL,
	[PROVIDER] [varchar](50) NULL,
	[PROVIDER_ID] [varchar](max) NULL,
 CONSTRAINT [PK_TB_M_USER_1] PRIMARY KEY CLUSTERED 
(
	[USER_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TB_PS_BREED]    Script Date: 4/24/2019 6:21:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_PS_BREED](
	[bread] [nvarchar](255) NULL,
	[MAPPING] [varchar](64) NULL,
	[COST] [money] NULL
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[TB_GT_ACT] ADD  CONSTRAINT [DF_TB_GT_ACT_CRE_DT]  DEFAULT (getdate()) FOR [CRE_DT]
GO
ALTER TABLE [dbo].[TB_GT_ACT] ADD  CONSTRAINT [DF_TB_GT_ACT_UPD_DT]  DEFAULT (getdate()) FOR [UPD_DT]
GO
ALTER TABLE [dbo].[TB_GT_ACT] ADD  CONSTRAINT [DF_TB_GT_ACT_CLIENT_ID]  DEFAULT ((0)) FOR [CLIENT_ID]
GO
ALTER TABLE [dbo].[TB_GT_FOD_GUIDE] ADD  CONSTRAINT [DF_TB_GT_FOD_GUIDE_CRE_DT]  DEFAULT (getdate()) FOR [CRE_DT]
GO
ALTER TABLE [dbo].[TB_GT_FOD_GUIDE] ADD  CONSTRAINT [DF_TB_GT_FOD_GUIDE_CRE_USR_ID]  DEFAULT ((1)) FOR [CRE_USR_ID]
GO
ALTER TABLE [dbo].[TB_GT_FOD_GUIDE] ADD  CONSTRAINT [DF_TB_GT_FOD_GUIDE_UPD_DT]  DEFAULT (getdate()) FOR [UPD_DT]
GO
ALTER TABLE [dbo].[TB_GT_FOD_GUIDE] ADD  CONSTRAINT [DF_TB_GT_FOD_GUIDE_UPD_USR_ID]  DEFAULT ((1)) FOR [UPD_USR_ID]
GO
ALTER TABLE [dbo].[TB_GT_MASTER] ADD  CONSTRAINT [DF_TB_GT_MASTER_STATUS]  DEFAULT (N'-') FOR [STATUS]
GO
ALTER TABLE [dbo].[TB_GT_MASTER] ADD  CONSTRAINT [DF_TB_GT_MASTER_FOR_RESALE]  DEFAULT ((0)) FOR [FOR_RESALE]
GO
ALTER TABLE [dbo].[TB_GT_MASTER] ADD  CONSTRAINT [DF_TB_GT_MASTER_CRE_DT]  DEFAULT (getdate()) FOR [CRE_DT]
GO
ALTER TABLE [dbo].[TB_GT_MASTER] ADD  CONSTRAINT [DF_TB_GT_MASTER_UPD_DT]  DEFAULT (getdate()) FOR [UPD_DT]
GO
ALTER TABLE [dbo].[TB_GT_OPR_COST] ADD  CONSTRAINT [DF_TB_GT_OPR_COST_CRE_DT]  DEFAULT (getdate()) FOR [CRE_DT]
GO
ALTER TABLE [dbo].[TB_GT_OPR_COST] ADD  CONSTRAINT [DF_TB_GT_OPR_COST_UPD_DT]  DEFAULT (getdate()) FOR [UPD_DT]
GO
ALTER TABLE [dbo].[TB_GT_PHOTO] ADD  CONSTRAINT [DF__TB_GT_PHO__CRE_D__3E52440B]  DEFAULT (getdate()) FOR [CRE_DT]
GO
ALTER TABLE [dbo].[TB_GT_PHOTO] ADD  CONSTRAINT [DF__TB_GT_PHO__UPD_D__3F466844]  DEFAULT (getdate()) FOR [UPD_DT]
GO
ALTER TABLE [dbo].[TB_GT_STATUS] ADD  CONSTRAINT [DF_TB_GT_STATUS_CRE_DT]  DEFAULT (getdate()) FOR [CRE_DT]
GO
ALTER TABLE [dbo].[TB_GT_STATUS] ADD  CONSTRAINT [DF_TB_GT_STATUS_UPD_DT]  DEFAULT (getdate()) FOR [UPD_DT]
GO
ALTER TABLE [dbo].[TB_GT_STATUS] ADD  CONSTRAINT [DF_TB_GT_STATUS_SHOW_IN_RPT]  DEFAULT ((0)) FOR [SHOW_IN_RPT]
GO
ALTER TABLE [dbo].[TB_M_CLIENT] ADD  CONSTRAINT [DF_TB_M_CLIENT_CRE_DT_1]  DEFAULT (getdate()) FOR [CRE_DT]
GO
ALTER TABLE [dbo].[TB_M_CLIENT] ADD  CONSTRAINT [DF_TB_M_CLIENT_UPD_DT_1]  DEFAULT (getdate()) FOR [UPD_DT]
GO
ALTER TABLE [dbo].[TB_M_RPT] ADD  CONSTRAINT [DF_TB_RPT_CRE_DT]  DEFAULT (getdate()) FOR [CRE_DT]
GO
ALTER TABLE [dbo].[TB_M_RPT] ADD  CONSTRAINT [DF_TB_RPT_UPD_DT]  DEFAULT (getdate()) FOR [UPD_DT]
GO
ALTER TABLE [dbo].[TB_M_RPT] ADD  CONSTRAINT [DF_TB_RPT_CLIENT_ID]  DEFAULT ((0)) FOR [CLIENT_ID]
GO
ALTER TABLE [dbo].[TB_M_USER] ADD  CONSTRAINT [DF_TB_M_USER_CRE_DT_1]  DEFAULT (getdate()) FOR [CRE_DT]
GO
/****** Object:  StoredProcedure [dbo].[sp_data_migration]    Script Date: 4/24/2019 6:21:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Prabhu 
-- Create date: 2019-02-06
-- Description:	Data migration from MS Access to SQL Server 
-- exec [dbo].[sp_data_migration]
-- =============================================
CREATE PROCEDURE [dbo].[sp_data_migration]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
	truncate table [dbo].[TB_GT_MASTER];
	
	SET IDENTITY_INSERT [dbo].[TB_GT_MASTER] ON

	INSERT INTO [dbo].[TB_GT_MASTER]
			   ([GT_ID], [GT_NO]           ,[GT_NAME]           ,[PURCHASE_DT]           ,[PURCHASE_WEIGHT]           ,[PURCHASE_AMOUNT]           ,[BIRTH_DT]
			   ,[SOLD_DT]           ,[SOLD_PRICE]           ,[STATUS]           ,[BREED]           ,[BUY_LOCATION]           ,[PARENT_GT_ID]           ,[SOLD_DATE]
			   ,[GENDER]           ,[REMARKS]           ,[FOR_RESALE]           ,[FATHER_GT_ID]           ,[SHED]           ,[CLIENT_ID]           ,[CRE_DT]
			   ,[CRE_USR_ID]           ,[UPD_DT]           ,[UPD_USR_ID])     
	SELECT [GoatID]      ,[GoatNO]      ,[GoatName]      ,[PurchaseDt]      ,[PurchaseWgt]      ,[BuyPrice]      ,[BirthDt]
		  ,[SoldDt]      ,[SoldPrice]      ,UPPER([Status])      ,UPPER([Bread])      ,[BuyLocation]      ,[ParentGoatID]      ,[SoldDate]
		  ,UPPER([Gender])      ,[Remarks]      ,[ForResale]      ,[FatherGoatID]      ,[Shed],1,getdate()
		  ,1,getdate(),1  FROM [dbo].[BK_TB_GT_MASTER]



	SET IDENTITY_INSERT [dbo].[TB_GT_MASTER] off

	update [TB_GT_MASTER] set client_id = 1;

	update m set m.status_id = st.GT_STATUS_ID from TB_GT_MASTER m join TB_GT_STATUS st ON m.STATUS = st.GT_STATUS_CODE;
	
	update TB_GT_MASTER set BREED = (select max(MAPPING) FROM [dbo].[TB_PS_BREED] where isnull(bread,'Others')=isnull(BREED,'Others'));

	update m set m.BREED_id = st.GT_STATUS_ID from TB_GT_MASTER m join TB_GT_STATUS st ON m.BREED = st.GT_STATUS_CODE;

	update m set m.BREED_id = (select top 1 GT_STATUS_ID FROM TB_GT_STATUS SS WHERE ss.GT_PARENT_STATUS='BREED' and ss.GT_STATUS_NAME='Others') from TB_GT_MASTER m 
	where m.BREED_id is null;

	update m set m.[GENDER_ID] = st.GT_STATUS_ID from TB_GT_MASTER m join TB_GT_STATUS st ON m.GENDER = st.GT_STATUS_CODE;
	update m set m.FOR_SALE_ID= st.GT_STATUS_ID from TB_GT_MASTER m join TB_GT_STATUS st ON CASE WHEN m.FOR_RESALE =0 THEN 'FALSE' ELSE 'TRUE' END = st.GT_STATUS_CODE;

	/*  
	delete from [dbo].[TB_GT_STATUS] where [GT_PARENT_STATUS]='OPR';
	DECLARE @iIDCnt as integer =0;
	select @iIDCnt= max([GT_STATUS_ID]) from [dbo].[TB_GT_STATUS];

	IF (@iIDCnt is null) set @iIDCnt = 0; 
	DBCC CHECKIDENT ('[TB_GT_STATUS]', RESEED, @iIDCnt); 	

	insert into [dbo].[TB_GT_STATUS]
	(GT_PARENT_STATUS,GT_STATUS_CODE,GT_STATUS_NAME,SHOW_IN_RPT,CLIENT_ID)
	SELECT 'OPR',type_code,ExpRevType,Include_in_report,1 FROM [dbo].[BK_TB_OPER_TYPE];
	*/

	truncate table [dbo].[TB_GT_OPR_COST];
	INSERT INTO [dbo].[TB_GT_OPR_COST]
			   ([OPR_DT]
			   ,[OPR_TYPE_CODE]
			   ,[CREDIT]
			   ,[DEBIT]
			   ,[REMARKS]
			   ,[CLIENT_ID],[GT_STATUS_ID])
	SELECT ct.OprDate,ty.ExpRevType,ct.Income,ct.Expense,ct.[Desc],1,ST.GT_STATUS_ID  FROM [dbo].[BK_TB_OPER_TYPE] ty, [dbo].[BK_TB_OPERTIONAL_COST] ct,[dbo].[TB_GT_STATUS] ST
	 where ty.Exprevtypeid = ct.ExpRevTypeID AND ty.ExpRevType = ST.GT_STATUS_NAME;


	truncate table  [dbo].[TB_GT_ACT];
    insert into [dbo].[TB_GT_ACT] (
	[ACT_DT]
		  ,[WGHT]      
		  ,[CRE_USR_ID]
		  ,[UPD_USR_ID]
		  ,[CLIENT_ID],GT_ID)
	SELECT [ActivityDt]
		  ,cast([Weight] as numeric(18,2))
		  ,1,1
		  ,1,[GoatID]
	  FROM [dbo].[BK_TB_GT_ACTIVITY]
END

GO
/****** Object:  StoredProcedure [dbo].[sp_get_gt_breed]    Script Date: 4/24/2019 6:21:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Prabhu
-- Create date: 2019-02-27
-- Description:	get farm breed details
-- =============================================
/*
	EXEC sp_get_gt_breed 1
*/
CREATE PROCEDURE [dbo].[sp_get_gt_breed]
	(@p_client_id bigint)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	select ss.GT_STATUS_NAME  BREED,count(*) CNT From TB_GT_MASTER m, TB_GT_STATUS SS   
	where m.STATUS_ID in (select st.GT_STATUS_ID from TB_GT_STATUS st where st.GT_STATUS_CODE='ALIVE')
	and m.BREED_ID = ss.GT_STATUS_ID
	group by ss.GT_STATUS_NAME
    
END
GO
/****** Object:  StoredProcedure [dbo].[sp_get_gt_fod_guide]    Script Date: 4/24/2019 6:21:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Prabhu
-- Create date: 2019-03-06
-- Description:	get cattle health and feed details
-- =============================================
/*
	EXEC sp_get_gt_fod_guide 1
*/
create PROCEDURE [dbo].[sp_get_gt_fod_guide]
	(@p_client_id bigint)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT TB2.*,
	(SELECT MAX(PELLET_GRAM) FROM TB_GT_FOD_GUIDE FD WHERE FD.FROM_WGHT_KG <= TB2.WGHT AND FD.TO_WGHT_KG >= TB2.WGHT) AS PELLET,
	(SELECT MAX(GREEN_GRAM) FROM TB_GT_FOD_GUIDE FD WHERE FD.FROM_WGHT_KG <= TB2.WGHT AND FD.TO_WGHT_KG >= TB2.WGHT) AS GREEN,
	(SELECT MAX(OREL_GRAM) FROM TB_GT_FOD_GUIDE FD WHERE FD.FROM_WGHT_KG <= TB2.WGHT AND FD.TO_WGHT_KG >= TB2.WGHT) AS OREL
	FROM
	(
		SELECT TB1.CLIENT_ID,TB1.GT_ID,TB1.GT_NO,TB1.SHED,TB1.GENDER, TB1.AGE,TB1.BREED
		,CASE WHEN TB1.WGHT IS NULL THEN TB1.PURCHASE_WEIGHT ELSE TB1.WGHT END WGHT 
		,TB1.TOT_MNTH	
		,CASE WHEN TB1.TOT_MNTH >0 THEN  ROUND((TB1.TOT_GAIN / TB1.TOT_MNTH),2) ELSE 0 END  AS AVG_WGHT_GAIN
		FROM 
		(
			select ms.CLIENT_ID,ms.GT_ID, ms.GT_NO,ms.GENDER,ms.SHED,
			ms.PURCHASE_WEIGHT 
			,(SELECT MAX(WGHT) FROM TB_GT_ACT AC WHERE AC.GT_ID= MS.GT_ID AND WGHT IS NOT NULL AND 
			ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT AX WHERE AX.GT_ID=AC.GT_ID)) AS WGHT
			,CASE WHEN MS.BIRTH_DT IS NULL THEN NULL ELSE CONCAT(Round(DATEDIFF(MONTH, MS.BIRTH_DT, GETDATE()) / 12,0),'.',(DATEDIFF(MONTH, MS.BIRTH_DT, GETDATE())%12)) END AGE
			,(select sum(WGHT_DIFF) FROM dbo.vw_rpt_wght_diff df where df.GT_ID = ms.GT_ID) as TOT_GAIN
			,(select count(*) FROM dbo.vw_rpt_wght_diff df where df.GT_ID = ms.GT_ID) as TOT_MNTH
			,(select top 1 st.GT_STATUS_NAME from TB_GT_STATUS st where st.GT_STATUS_ID = ms.BREED_ID) BREED
			From TB_GT_MASTER ms, TB_GT_STATUS st  
			where ms.STATUS='ALIVE'  and ms.STATUS_ID=st.GT_STATUS_ID  and ms.CLIENT_ID = @p_client_id and st.CLIENT_ID=@p_client_id
		) TB1
	) TB2
END
GO
/****** Object:  StoredProcedure [dbo].[sp_get_gt_gender]    Script Date: 4/24/2019 6:21:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Prabhu
-- Create date: 2019-02-27
-- Description:	get farm breed details
-- =============================================
/*
	EXEC sp_get_gt_gender 1
*/
CREATE PROCEDURE [dbo].[sp_get_gt_gender]
	(@p_client_id bigint)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT 
	TB2.*
	,CASE WHEN TB2.REQ_QTY < TB2.CNT THEN  'Sell' ELSE 'Buy' END ACT
	,CASE WHEN TB2.REQ_QTY < TB2.CNT THEN ROUND(TB2.CNT- TB2.REQ_QTY,0) ELSE ROUND(TB2.REQ_QTY - TB2.CNT,0) END ACT_QTY
	,st.GT_STATUS_NAME
	FROM
	(
		SELECT *
		,round(cast(TB1.CNT as float) /cast((select count(*) From TB_GT_MASTER where status='ALIVE') as float) *100,0)  as PERC
		,case when TB1.GENDER = 'M' 
			then ROUND(((0.1*(select count(*) From TB_GT_MASTER where status='ALIVE' and GENDER='F'))/0.91),0) 
			else ROUND(((0.91*(select count(*) From TB_GT_MASTER where status='ALIVE' and GENDER='M'))/0.1),0) 
		 end REQ_QTY	 
		FROM 
		(
			select upper(GENDER) GENDER,count(*) CNT	
			From TB_GT_MASTER where status='ALIVE'  and CLIENT_ID=@p_client_id
			group by upper(GENDER)
		) TB1
	) TB2 left join TB_GT_STATUS st 
	on tb2.GENDER = st.[GT_STATUS_CODE]
    
END



    
	--
	
GO
/****** Object:  StoredProcedure [dbo].[sp_get_pft_mnth_sumry]    Script Date: 4/24/2019 6:21:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Prabhu
-- Create date: 2019-02-26
-- Description:	Get the Profit details for the dashboard screen
-- =============================================
--exec sp_get_pft_mnth_sumry @p_client_id=1,@p_dt='2018-07-01,2018-06-01'
/*
	exec sp_get_pft_mnth_sumry 1,null,'D'
*/
CREATE PROCEDURE [dbo].[sp_get_pft_mnth_sumry]
	@p_client_id bigint,
	@p_dt varchar(1024),
	@p_ord varchar(1)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE @TB TABLE (DT date);
	INSERT @TB SELECT * FROM dbo.SplitList(@p_dt, ',');

	--select * from @TB_STATUS_ID

	SELECT TB5.*
	,CASE WHEN (ISNULL(FEED_COST,0) + ISNULL(OTHER_EXPENSE,0)) >0 THEN ROUND(ISNULL(TOT_PROFIT_ASS_GAIN,0)/(ISNULL(FEED_COST,0) + ISNULL(OTHER_EXPENSE,0))*100,2) ELSE 100 END PROFIT_PERC
	FROM 
	(
		SELECT TB4.*
		,ROUND(CASE WHEN TB4.CATTLE_CNT > 0  THEN TB4.WGHT_GAIN / TB4.CATTLE_CNT ELSE 0 END,1) AVG_WGHT_GAIN
		,ROUND(CASE WHEN TB4.CATTLE_CNT > 0  THEN TB4.FEED_COST / TB4.CATTLE_CNT ELSE 0 END,1) AVG_FEED_COST
		,((Isnull(TB4.SELL_PROFIT,0) + isnull(TB4.WGHT_GAIN_PROFIT,0) + isnull(TB4.OTHER_INCOME,0)) - (ISNULL(TB4.FEED_COST,0)+ISNULL(TB4.OTHER_EXPENSE,0))) AS TOT_PROFIT_ASS_GAIN
		,(ISNULL(TB4.FEED_COST,0)+ISNULL(TB4.OTHER_EXPENSE,0)) TOT_EXPENSE
		--,right(REPLACE(CONVERT(VARCHAR(11), TB4.MNTH, 106),' ','-'),8) DIS_MNTH		
		,replace(right(Convert(varchar(10),TB4.MNTH,6),6),' ','-') DIS_MNTH
		FROM 
		(
			SELECT TB3.*
			,(TB3.CUR_MNTH_WGHT - TB3.PRV_MNTH_WGHT) AS WGHT_GAIN
			,(TB3.CUR_MNTH_WGHT_COST - TB3.PRV_MNTH_WGHT_COST) AS WGHT_GAIN_PROFIT
			,isnull((select SUM([DEBIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND ST.REF_CODE='REF_CODE_FOD' 
				AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
			),0) FEED_COST
			,(select SUM([DEBIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND isnull(ST.REF_CODE,'-') <> 'REF_CODE_FOD' AND ST.GT_STATUS_CODE='CODE_EXPENSE'
				AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
			) OTHER_EXPENSE
			,(select SUM([DEBIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND ST.GT_STATUS_CODE='CODE_INVEST'
				AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
			) ASSET_INVEST
			,(select SUM([CREDIT]) from TB_GT_OPR_COST CT, TB_GT_STATUS ST WHERE CT.GT_STATUS_ID = ST.GT_STATUS_ID AND ST.GT_STATUS_CODE='CODE_INCOME'
				AND YEAR(CT.OPR_DT)=YEAR(tb3.MNTH)  AND MONTH(CT.OPR_DT)=MONTH(tb3.MNTH) 
			) OTHER_INCOME
			FROM
			(
				SELECT tb2.*
				, (select count(*) from TB_GT_ACT ac where 
					ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(tb2.MNTH) AND month(acs.ACT_DT)=month(tb2.MNTH))
					--and year(ac.ACT_DT)= year(tb2.MNTH) AND month(ac.ACT_DT)=month(tb2.MNTH)
					) as CATTLE_CNT
				,(tb2.SELL_COST - tb2.PURCHASE_COST) as SELL_PROFIT
				, CASE WHEN tb2.SELL_COST > 0 THEN round(((tb2.SELL_COST- tb2.PURCHASE_COST)/tb2.SELL_COST)*100,2)  ELSE 0 END as SELL_PROFIT_PERC				
				--,(select sum(ac.[WGHT]) from TB_GT_ACT ac where 
				--	--year(ac.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(ac.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH))
				--	--and 
				--	ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(acs.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH)))	
				--	) PRV_MNTH_WGHT
				--,(select sum(ac.[WGHT]) from TB_GT_ACT ac where 			    
				--	ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(tb2.MNTH) AND month(acs.ACT_DT)=month(tb2.MNTH))	
				--	--and year(ac.ACT_DT)= year(tb2.MNTH) AND month(ac.ACT_DT)=month(tb2.MNTH)
				--	) CUR_MNTH_WGHT	
				--,(select sum(ac.[WGHT] * s.[BREED_COST_PER_KG] ) from TB_GT_ACT ac,TB_GT_MASTER m, TB_GT_STATUS s where 
				--	ac.GT_ID = m.GT_ID and m.BREED = s.GT_STATUS_CODE 
				--	--and year(ac.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(ac.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH))
				--	and ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(DATEADD(M, -1, tb2.MNTH)) AND month(acs.ACT_DT)=month(DATEADD(M, -1, tb2.MNTH)))	
				--	) PRV_MNTH_WGHT_COST
					--,(select sum(ac.[WGHT]  * s.[BREED_COST_PER_KG]) from TB_GT_ACT ac,TB_GT_MASTER m, TB_GT_STATUS s where 		
					--ac.GT_ID = m.GT_ID and m.BREED = s.GT_STATUS_CODE 	    
					--and ac.ACT_DT = (SELECT MAX(ACT_DT) FROM TB_GT_ACT acs WHERE year(acs.ACT_DT)= year(tb2.MNTH) AND month(acs.ACT_DT)=month(tb2.MNTH))	
					----and year(ac.ACT_DT)= year(tb2.MNTH) AND month(ac.ACT_DT)=month(tb2.MNTH)
					--) CUR_MNTH_WGHT_COST
				,(select sum(ab.PRV_WGHT) from [dbo].[fn_tb_get_wght_diff](1,tb2.MNTH) ab) as PRV_MNTH_WGHT	
				,(select sum(ISNULL(ab.ACT_WGHT,0)) from [dbo].[fn_tb_get_wght_diff](1,tb2.MNTH) ab) as CUR_MNTH_WGHT	
				,(select sum(ISNULL(ab.BREED_COST,0) * ISNULL(ab.PRV_WGHT,0)) from [dbo].[fn_tb_get_wght_diff](1,tb2.MNTH) ab) PRV_MNTH_WGHT_COST		
				,(select sum(ISNULL(ab.BREED_COST,0) * ISNULL(ab.ACT_WGHT,0)) from [dbo].[fn_tb_get_wght_diff](1,tb2.MNTH) ab) as CUR_MNTH_WGHT_COST	
				from 
				(
					select  CONVERT(date, tb1.EOM_DT) MNTH					
					,(select count(*) from TB_GT_MASTER ms where ms.sold_dt is not null 
						and year(ms.sold_dt) = year(tb1.dt) and month(ms.sold_dt)= month(tb1.dt)  
						and ms.CLIENT_ID= tb1.CLIENT_ID AND ms.STATUS_ID in
						 (SELECT GT_STATUS_ID FROM TB_GT_STATUS SS WHERE SS.GT_STATUS_CODE IN ('SOLD','DEAD'))
						) as SALE_CNT
					,isnull((select SUM(ms.PURCHASE_AMOUNT) from TB_GT_MASTER ms where ms.sold_dt is not null 
						and year(ms.sold_dt) = year(tb1.dt) and month(ms.sold_dt)= month(tb1.dt) 
						and ms.CLIENT_ID= tb1.CLIENT_ID  AND ms.STATUS_ID in 
						(SELECT GT_STATUS_ID FROM TB_GT_STATUS SS WHERE SS.GT_STATUS_CODE IN ('SOLD','DEAD'))
						),0) as PURCHASE_COST
					,isnull((select SUM(ms.SOLD_PRICE) from TB_GT_MASTER ms where ms.sold_dt is not null 
						and year(ms.sold_dt) = year(tb1.dt) and month(ms.sold_dt)= month(tb1.dt) 
						and ms.CLIENT_ID= tb1.CLIENT_ID  AND ms.STATUS_ID in 
						(SELECT GT_STATUS_ID FROM TB_GT_STATUS SS WHERE SS.GT_STATUS_CODE IN ('SOLD','DEAD'))
						),0) as SELL_COST
					,tb1.CLIENT_ID
					from 
					(
						select EOMONTH(DT) EOM_DT, DT,client_id From vw_client_txn_dt vw
						where vw.CLIENT_ID=@p_client_id and ((vw.DT in (SELECT DT FROM @TB)) or (@p_dt is null))
					) tb1
				) TB2

			) TB3
		) TB4 
	) TB5 ORDER BY 
	case when @p_ord = 'A' then MNTH else NULL end ASC,
	case when @p_ord = 'D' then MNTH else NULL end DESC 
END
GO
/****** Object:  StoredProcedure [dbo].[sp_get_profit_detail]    Script Date: 4/24/2019 6:21:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Prabhu
-- Create date: 2019-02-26
-- Description:	get profit summary details for the current or previous month
/*
	EXEC sp_get_profit_detail 1
*/
-- =============================================
CREATE PROCEDURE [dbo].[sp_get_profit_detail]
	(@p_client_id bigint)
AS
BEGIN

	select right(REPLACE(CONVERT(VARCHAR(11), MNTH, 106),' ','-'),8) MNTH,
	CATTLE_CNT,
	--CONCAT((SELECT MAX([GT_STATUS_NAME]) FROM TB_GT_STATUS WHERE [GT_STATUS_CODE]='LOCAL_CURRENCY'),' ', TOT_PROFIT_ASS_GAIN) AS 
	TOT_PROFIT_ASS_GAIN,
	CUR_MNTH_WGHT,
	CASE WHEN (ISNULL(FEED_COST,0) + ISNULL(OTHER_EXPENSE,0)) >0 THEN ROUND(ISNULL(TOT_PROFIT_ASS_GAIN,0)/(ISNULL(FEED_COST,0) + ISNULL(OTHER_EXPENSE,0))*100,2) ELSE 100 END PROFIT_PERC,
	CUR_MNTH_WGHT_COST
	From vw_rpt_pft_mnth_sumry 
	WHERE MNTH = (select Max(DT) From vw_client_txn_dt WHERE CLIENT_ID =@p_client_id ) AND CLIENT_ID =@p_client_id
	UNION ALL 
	SELECT right(REPLACE(CONVERT(VARCHAR(11), GETDATE(), 106),' ','-'),8)
	,NULL
	,CONCAT((SELECT MAX([GT_STATUS_NAME]) FROM TB_GT_STATUS WHERE [GT_STATUS_CODE]='LOCAL_CURRENCY'),' --')
	,NULL
	,NULL
	,null
	FROM DUAL WHERE 0=(SELECT COUNT(*) FROM vw_client_txn_dt WHERE CLIENT_ID =@p_client_id)

END
GO
/****** Object:  StoredProcedure [dbo].[sp_get_wght_diff]    Script Date: 4/24/2019 6:21:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Prabhu
-- Create date: 2019-03-09
-- Description:	GET CATTLE WEIGHT DIFFERENCE BY MONTH
-- =============================================
/*
	EXEC sp_get_wght_diff 1,'2018-11-30'
*/
CREATE PROCEDURE [dbo].[sp_get_wght_diff]
	(@p_client_id bigint,
	 @p_as_of_dt date)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	select 
	ac.SNO
	,ac.ACT_ID RID
	,ac.GT_ID GID
	,ac.GT_NO GNO
	,ac.STATUS_NAME STS
	,ac.BREED_NAME BRD
	,(select top 1 PR.GT_NO from TB_GT_MASTER PR WHERE PR.GT_ID=ac.PARENT_GT_ID )MNO
	,ac.SHED SHD
	,ac.SOLD_DT
	,ac.AGE
	,ac.PDT 
	,ac.PRV_WGHT PWT
	,ac.ADT
	,ac.ACT_WGHT AWT 
	from 
	fn_tb_get_wght_diff(@p_client_id,@p_as_of_dt) ac
	--


END
/*


	select tmp3.*
    ,REPLACE(CONVERT(CHAR(9),tmp3.PRV_DT, 6),' ', '-') PDT
    ,REPLACE(CONVERT(CHAR(9),tmp3.ACT_DT, 6),' ', '-') ADT
    from 
    (
        SELECT ROW_NUMBER() OVER(ORDER BY ACT_ID ) AS SNO
        ,tmp2.ACT_ID RID,tmp2.GT_ID GID, M.GT_NO GNO
        ,(select top 1 ss.GT_STATUS_NAME from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.STATUS_ID) STS
        ,(select top 1 ss.GT_STATUS_NAME from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.BREED_ID) BRD
        ,m.PARENT_GT_ID MNO,m.SHED SHD,m.SOLD_DT
        ,CASE WHEN M.BIRTH_DT IS NULL THEN NULL ELSE CONCAT(Round(DATEDIFF(MONTH, M.BIRTH_DT, GETDATE()) / 12,0),'.',(DATEDIFF(MONTH, M.BIRTH_DT, GETDATE())%12)) END AGE
        ,PRV_DT
        ,tmp2.PRV_WGHT PWT
        ,ACT_DT
        , tmp2.WGHT AWT  
        ,(select top 1 ss.GT_STATUS_CODE from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.STATUS_ID) SCOD
        from  
        (
            select tb2.*
            ,(select top 1 act_id from TB_GT_ACT acc where acc.ACT_DT = tb2.ACT_DT AND acc.GT_ID= tb2.GT_ID) as ACT_ID 
            ,(select top 1 WGHT from TB_GT_ACT acc where acc.ACT_DT = tb2.ACT_DT AND acc.GT_ID= tb2.GT_ID) as WGHT 
            ,(select top 1 WGHT from TB_GT_ACT acc where acc.ACT_DT = tb2.PRV_DT AND acc.GT_ID= tb2.GT_ID) as PRV_WGHT 
            from
            ( 
                select 				
                    cs.GT_ID
                ,(SELECT MAX(ACT_DT) FROM TB_GT_ACT ACC WHERE ACC.ACT_DT<'2019-11-30') PRV_DT
                ,CAST('2019-11-30' as date) ACT_DT FROM
                (
                    select GT_ID from TB_GT_ACT AC where ac.act_dt='2019-11-30' 
                    AND ac.CLIENT_ID=1
                    union 
                    select GT_ID FROM  TB_GT_ACT AC where ac.act_dt=(SELECT MAX(ACT_DT) 
					FROM TB_GT_ACT ACC WHERE ACC.ACT_DT<'2019-11-30' 
                    AND ac.CLIENT_ID=1
                    )
                ) CS
            ) tb2
        ) tmp2 left join TB_GT_MASTER M
        ON TMP2.GT_ID = M.GT_ID
    ) tmp3  where 
    (SCOD='sold' and tmp3.SOLD_DT> DATEADD(s,-1,DATEADD(mm, DATEDIFF(m,0,tmp3.ACT_DT)+1,0)))
    or
    (tmp3.SCOD <>'sold')
    */


    
	--
	
GO
/****** Object:  StoredProcedure [dbo].[x_sp_get_profit_detail]    Script Date: 4/24/2019 6:21:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Prabhu
-- Create date: 2019-02-26
-- Description:	get profit summary details for the current or previous month
/*
	EXEC sp_get_profit_detail 1
*/
-- =============================================
CREATE PROCEDURE [dbo].[x_sp_get_profit_detail]
	(@p_client_id bigint)
AS
BEGIN

	select right(REPLACE(CONVERT(VARCHAR(11), MNTH, 106),' ','-'),8) MNTH,
	CATTLE_CNT,
	--CONCAT((SELECT MAX([GT_STATUS_NAME]) FROM TB_GT_STATUS WHERE [GT_STATUS_CODE]='LOCAL_CURRENCY'),' ', TOT_PROFIT_ASS_GAIN) AS 
	TOT_PROFIT_ASS_GAIN,
	CUR_MNTH_WGHT,
	CASE WHEN (ISNULL(FEED_COST,0) + ISNULL(OTHER_EXPENSE,0)) >0 THEN ROUND(ISNULL(TOT_PROFIT_ASS_GAIN,0)/(ISNULL(FEED_COST,0) + ISNULL(OTHER_EXPENSE,0))*100,2) ELSE 100 END PROFIT_PERC,
	CUR_MNTH_WGHT_COST
	From vw_rpt_pft_mnth_sumry 
	WHERE MNTH = (select Max(DT) From vw_client_txn_dt WHERE CLIENT_ID =@p_client_id ) AND CLIENT_ID =@p_client_id
	UNION ALL 
	SELECT right(REPLACE(CONVERT(VARCHAR(11), GETDATE(), 106),' ','-'),8)
	,NULL
	,CONCAT((SELECT MAX([GT_STATUS_NAME]) FROM TB_GT_STATUS WHERE [GT_STATUS_CODE]='LOCAL_CURRENCY'),' --')
	,NULL
	,NULL
	,null
	FROM DUAL WHERE 0=(SELECT COUNT(*) FROM vw_client_txn_dt WHERE CLIENT_ID =@p_client_id)

END
GO
