<?php get_header(); ?>

<div class="flex-1 flex items-center justify-center px-4">
  <div class="max-w-3xl py-12 text-dark font-body">

    <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
      <article class="mb-12">
        <h2 class="text-2xl md:text-3xl font-title font-bold mb-2">
          <a href="<?php the_permalink(); ?>" class="text-primary hover:text-accent transition-colors">
            <?php the_title(); ?>
          </a>
        </h2>
        <div class="text-base">
          <?php the_excerpt(); ?>
        </div>
      </article>
    <?php endwhile; else : ?>
      <p>No hay publicaciones.</p>
    <?php endif; ?>

  </div>
</div>

<?php get_footer(); ?>
