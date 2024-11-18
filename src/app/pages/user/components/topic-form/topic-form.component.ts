import { Component, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AppRoutes } from '../../../../shared/enums/app-routes.enum';
import { SendTopicService } from '../../../../shared/services/core/send-topic.service';

interface Topic {
    name: string;
    title: string;
    description: string;
}

@Component({
    selector: 'app-topic-form',
    templateUrl: './topic-form.component.html',
    styleUrl: './topic-form.component.scss',
})
export class TopicFormComponent {
    public routes = AppRoutes.User.Topic;
    public topicForm: FormGroup;
    public imageSrc: string | ArrayBuffer | null = null;
    public categoriesForForm: Array<string>;
    public categories: Topic[] = categories;
    public selectedIcon: string | ArrayBuffer | null;

    private readonly router: Router = inject(Router);
    public readonly sendTopicService: SendTopicService =
        inject(SendTopicService);

    public ngOnInit(): void {
        this.topicForm = this.sendTopicService.currentTopic;
        this.categoriesForForm = this.categories.map(
            (category) => category.name
        );
    }

    public getCurrentTopicInfo(): { title: string; description: string } {
        const category = this.topicForm.get('category')?.value;
        return this.categories.filter(
            (categoryObj) => categoryObj.name === category
        )[0];
    }

    public onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];

        this.topicForm.patchValue({ icon: file });
        this.updateSelectedIcon();
    }

    public onNextButtonClick(): void {
        if (this.topicForm.valid) {
            this.router.navigateByUrl('user/topic/contact-info');
        }
    }

    public updateSelectedIcon(): void {
        const file = this.topicForm.get('icon')?.value;

        if (file) {
            const reader = new FileReader();
            
            reader.onload = () => this.selectedIcon = reader.result;
            reader.readAsDataURL(file);
        }
    }
}

const categories =[
    {
        name: 'Politics',
        title: 'Topics related to government policies, political movements, elections, and political figures',
        description:
            'Examples: Election campaigns, policy reforms, political endorsements.',
    },
    {
        name: 'Social',
        title: 'Topics that address societal issues, community initiatives, and social movements',
        description:
            'Examples: Social justice campaigns, community events, public health initiatives.',
    },
    {
        name: 'Environment',
        title: 'Topics focused on environmental issues, sustainability, and conservation efforts',
        description:
            'Examples: Climate change initiatives, wildlife conservation, renewable energy projects.',
    },
    {
        name: 'Health',
        title: 'Topics related to public health, healthcare policies, medical advancements, and wellness',
        description:
            'Examples: Healthcare reforms, mental health awareness, medical research breakthroughs.',
    },
    {
        name: 'Technology',
        title: 'Topics covering advancements in technology, digital innovations, and tech-related policies',
        description:
            'Examples: Open source software support, data protection advocacy, tech industry news.',
    },
    {
        name: 'Economy',
        title: 'Topics concerning economic policies, financial initiatives, market trends, and economic reforms',
        description:
            'Examples: Wealth redistribution, financial literacy promotion, economic stability measures.',
    },
    {
        name: 'Education',
        title: 'Topics related to educational policies, reforms, initiatives, and advancements in learning',
        description:
            'Examples: STEM education expansion, student loan forgiveness, homeschooling support.',
    },
    {
        name: 'Entertainment',
        title: 'Topics covering the entertainment industry, media, celebrity culture, and related events',
        description:
            'Examples: Movie awards, reality TV discussions, celebrity endorsements.',
    },
    {
        name: 'Lifestyle',
        title: 'Topics that pertain to personal well-being, cultural trends, and lifestyle choices',
        description:
            'Examples: Body positivity, veganism promotion, volunteerism encouragement.',
    },
    {
        name: 'Rights',
        title: 'Topics focused on civil rights, human rights, and advocacy for individual freedoms',
        description:
            'Examples: Disability rights, reproductive rights, free speech defense.',
    },
    {
        name: 'Culture',
        title: 'Topics that celebrate diverse cultures, traditions, and cultural initiatives',
        description:
            "Examples: Cultural diversity support, indigenous peoples' rights, celebration of cultural figures.",
    },
    {
        name: 'Science',
        title: 'Topics related to scientific research, innovations, and advancements across various fields',
        description:
            'Examples: Climate science, medical research, technological innovations.',
    },
    {
        name: 'Community',
        title: 'Topics that emphasize community engagement, local initiatives, and community support',
        description:
            'Examples: Homelessness solutions, affordable housing, community volunteerism.',
    },
    {
        name: 'International',
        title: 'Topics that address global issues, international relations, and cross-border initiatives',
        description:
            'Examples: International oil markets stabilization, global immigration policies, data protection laws.',
    },
    {
        name: 'Sports',
        title: 'Topics related to various sports leagues, teams, events, and fan support',
        description:
            'Examples: NFL team support, MLB team rallies, NBA team pride, MLS team enthusiasm.',
    },
];