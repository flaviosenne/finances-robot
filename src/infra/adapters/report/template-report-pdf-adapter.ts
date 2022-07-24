import * as ejs from 'ejs'
import {
    join,
    create,
    ReleaseType,
    ReleaseModel,
    TemplateProtocol,
    TemplateAttachmentsInterface,
} from './imports';

const PATH_TEMPALTE = join(__dirname, '..', '..', '..', '..','public', 'mailTemplateReport.ejs')

export class TemplateReportPdfImpl implements TemplateProtocol {

    async generateTemplate(content: any): Promise<TemplateAttachmentsInterface> {
        return await this.getTemplateReportPdf(content)
    }

    private async getTemplateReportPdf(releases: ReleaseModel[]) {


        return new Promise<TemplateAttachmentsInterface>(async resolve => {

            // const category = await postingsService.frequencyCategory(postings)
            // const expensesPeriod = await postingsService.frequencyExpenses(postings)
            // const revenuesPeriod = await postingsService.frequencyRevenues(postings)
            // const expensesPeriodTwelveMonth = await postingsService.frequencyExpenses(postingsTwelveMonth)
            // const revenuesPeriodTwelveMonth = await postingsService.frequencyRevenues(postingsTwelveMonth)

            const username = releases
                .map(release => `${release.user.firstName} ${release.user.lastName}`)
                .reduce((name: string, element): string => element)

            const expenses = releases.filter(release => release.type == ReleaseType.EXPENSE)
            const receps = releases.filter(release => release.type == ReleaseType.RECEP)

            let totalExpense = 0
            let totalRevenue = 0

            expenses.forEach(expense => {
                return totalExpense += Number(expense.value)
            })

            receps.forEach(recep => {
                return totalRevenue += Number(recep.value)
            })

            const formatValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
            const formatDate = new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' })

            const template = await ejs.renderFile(PATH_TEMPALTE, {
                'releases': releases,
                'username': username,
                'today': new Date(),
                'situation': (totalRevenue - totalExpense) >= 0 ? 'POSITIVO' : 'NEGATIVO',
                'situationPercent': ((totalExpense / totalRevenue) * 100).toFixed(2) + '%',
                'totalRecep': totalRevenue,
                'totalExpense': totalExpense,
                'total': (totalRevenue - totalExpense),
                'formatValue': formatValue,
                'formatDate': formatDate,
                // 'category': category['categories'],
                // 'frequency': category['frequency'],
                // 'periodExpense': expensesPeriod['period'],
                // 'frequencyExpense': expensesPeriod['frequency'],
                // 'periodRevenue': revenuesPeriod['period'],
                // 'frequencyRevenue': revenuesPeriod['frequency'],
                // 'periodExpenseTwelveMonth': expensesPeriodTwelveMonth['period'],
                // 'frequencyExpenseTwelveMonth': expensesPeriodTwelveMonth['frequency'],
                // 'periodRevenueTwelveMonth': revenuesPeriodTwelveMonth['period'],
                // 'frequencyRevenueTwelveMonth': revenuesPeriodTwelveMonth['frequency'],

            })

            create(template, { format: 'A3' }).toBuffer((err: any, result: any) => {
                if (err) console.log('error in generate buffer of pdf', err)

                resolve({ content: result, filename: 'relatório-mensal.pdf' })
            })

        })
    }
}